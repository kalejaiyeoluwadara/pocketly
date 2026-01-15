import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getAuthenticatedUser, handleApiError, unauthorizedResponse, notFoundResponse } from "@/lib/api-helpers";
import BankAccount from "@/models/BankAccount";
import mongoose from "mongoose";
import { syncAccountTransactions } from "@/lib/mono-sync";

/**
 * POST /api/bank-accounts/[id]/sync
 * Manually trigger transaction sync for a specific account
 */
export async function POST(
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
      isActive: true,
    });

    if (!account) {
      return notFoundResponse("Bank account");
    }

    const result = await syncAccountTransactions(account._id.toString());

    return NextResponse.json({
      message: "Sync completed",
      transactionsAdded: result.transactionsAdded,
      transactionsUpdated: result.transactionsUpdated,
      errors: result.errors,
    });
  } catch (error) {
    return handleApiError(error, "Failed to sync bank account");
  }
}
