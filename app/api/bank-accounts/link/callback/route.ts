import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
} from "@/lib/api-helpers";
import BankAccount from "@/models/BankAccount";
import mongoose from "mongoose";
import {
  exchangeCodeForAccountId,
  getAccountInfo,
  getAccountBalance,
} from "@/lib/mono";
import { syncAccountTransactions } from "@/lib/mono-sync";

/**
 * POST /api/bank-accounts/link/callback
 * Handle Mono Connect callback after user links their account via the widget
 * Receives the authorization code from the frontend and exchanges it for account info
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validationError = validateRequest(body, ["code"]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { code } = body;

    console.log("Received authorization code from Mono Connect Widget");

    // Exchange code for account ID
    let monoAccountId: string;
    try {
      monoAccountId = await exchangeCodeForAccountId(code);
      console.log("Successfully exchanged code for account ID:", monoAccountId);
    } catch (error) {
      console.error("Failed to exchange code:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to exchange code";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Check if account already exists
    const existingAccount = await BankAccount.findOne({
      monoAccountId,
      userId: user.id,
    });

    if (existingAccount) {
      console.log("Re-linking existing account:", monoAccountId);
      // Update existing account
      existingAccount.isActive = true;
      existingAccount.syncStatus = "active";
      existingAccount.lastError = undefined;
      await existingAccount.save();

      // Perform initial sync
      try {
        await syncAccountTransactions(existingAccount._id.toString());
      } catch (syncError) {
        console.error("Initial sync error:", syncError);
        // Continue even if sync fails
      }

      return NextResponse.json({
        id: existingAccount._id.toString(),
        message: "Account re-linked successfully",
      });
    }

    // Fetch account information from Mono
    let accountInfo;
    let balance;
    try {
      console.log("Fetching account info from Mono...");
      accountInfo = await getAccountInfo(monoAccountId);
      console.log("Raw account info response:", JSON.stringify(accountInfo, null, 2));
      balance = await getAccountBalance(monoAccountId);
      console.log("Balance retrieved:", balance);
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch account info";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Validate account info structure
    if (!accountInfo.account) {
      console.error("Invalid account info - missing account object");
      return NextResponse.json(
        { error: "Invalid account information received from Mono" },
        { status: 500 }
      );
    }

    const account = accountInfo.account;
    
    // Extract bank info - Mono API v2 uses 'institution' field
    const bankInfo = account.institution || account.bank;
    
    if (!bankInfo) {
      console.error("Invalid account info - missing bank/institution object");
      console.error("Account structure:", JSON.stringify(account, null, 2));
      return NextResponse.json(
        { error: "Bank information not available for this account" },
        { status: 500 }
      );
    }

    // Extract account details with fallbacks for different field names
    const bankName = bankInfo.name || "Unknown Bank";
    const accountNumber = account.account_number || account.accountNumber || "";
    const accountName = account.name || account.accountName || "Account";
    const accountType = account.type || "Unknown";
    const currency = account.currency || "NGN";

    console.log("Extracted account details:", {
      bankName,
      accountNumber,
      accountName,
      accountType,
      currency,
      balance,
    });

    // Create new bank account record
    console.log("Creating new bank account record...");
    const bankAccount = await BankAccount.create({
      userId: new mongoose.Types.ObjectId(user.id),
      monoAccountId,
      monoCode: code,
      bankName,
      accountNumber,
      accountName,
      accountType,
      currency,
      balance,
      isActive: true,
      syncStatus: "active",
    });

    console.log("Bank account created successfully:", bankAccount._id);

    // Perform initial transaction sync
    try {
      await syncAccountTransactions(bankAccount._id.toString());
      console.log("Initial transaction sync completed");
    } catch (syncError) {
      console.error("Initial sync error:", syncError);
      // Continue even if sync fails - account is still created
    }

    return NextResponse.json(
      {
        id: bankAccount._id.toString(),
        userId: bankAccount.userId.toString(),
        monoAccountId: bankAccount.monoAccountId,
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName,
        accountType: bankAccount.accountType,
        currency: bankAccount.currency,
        balance: bankAccount.balance,
        isActive: bankAccount.isActive,
        syncStatus: bankAccount.syncStatus,
        createdAt: bankAccount.createdAt.toISOString(),
        updatedAt: bankAccount.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bank account linking error:", error);
    return handleApiError(error, "Failed to link bank account");
  }
}
