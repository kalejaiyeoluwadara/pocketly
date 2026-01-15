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
 * Handle Mono Connect callback after user links their account
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

    // Exchange code for account ID
    let monoAccountId: string;
    try {
      monoAccountId = await exchangeCodeForAccountId(code);
    } catch (error) {
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
      accountInfo = await getAccountInfo(monoAccountId);
      balance = await getAccountBalance(monoAccountId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch account info";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Create new bank account record
    const bankAccount = await BankAccount.create({
      userId: new mongoose.Types.ObjectId(user.id),
      monoAccountId,
      monoCode: code,
      bankName: accountInfo.account.bank.name,
      accountNumber: accountInfo.account.accountNumber,
      accountName: accountInfo.account.accountName,
      accountType: accountInfo.account.type,
      currency: accountInfo.account.currency,
      balance,
      isActive: true,
      syncStatus: "active",
    });

    // Perform initial transaction sync
    try {
      await syncAccountTransactions(bankAccount._id.toString());
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
    return handleApiError(error, "Failed to link bank account");
  }
}
