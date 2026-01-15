import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getAuthenticatedUser, handleApiError, unauthorizedResponse, notFoundResponse } from "@/lib/api-helpers";
import BankAccount from "@/models/BankAccount";
import mongoose from "mongoose";
import { getAccountInfo, unlinkAccount as unlinkMonoAccount, reauthenticateAccount } from "@/lib/mono";

/**
 * GET /api/bank-accounts/[id]
 * Get specific bank account details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const accountId = params.id;
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return notFoundResponse("Bank account");
    }

    const account = await BankAccount.findOne({
      _id: accountId,
      userId: user.id,
    }).lean();

    if (!account) {
      return notFoundResponse("Bank account");
    }

    return NextResponse.json({
      id: account._id.toString(),
      userId: account.userId.toString(),
      monoAccountId: account.monoAccountId,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountType: account.accountType,
      currency: account.currency,
      balance: account.balance,
      isActive: account.isActive,
      syncStatus: account.syncStatus,
      lastSyncAt: account.lastSyncAt?.toISOString(),
      lastError: account.lastError,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch bank account");
  }
}

/**
 * DELETE /api/bank-accounts/[id]
 * Unlink bank account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const accountId = params.id;
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return notFoundResponse("Bank account");
    }

    const account = await BankAccount.findOne({
      _id: accountId,
      userId: user.id,
    });

    if (!account) {
      return notFoundResponse("Bank account");
    }

    // Unlink from Mono
    try {
      await unlinkMonoAccount(account.monoAccountId);
    } catch (error) {
      console.error("Error unlinking from Mono:", error);
      // Continue with local deletion even if Mono unlink fails
    }

    // Mark as inactive instead of deleting to preserve transaction history
    account.isActive = false;
    await account.save();

    return NextResponse.json({ message: "Bank account unlinked successfully" });
  } catch (error) {
    return handleApiError(error, "Failed to unlink bank account");
  }
}

