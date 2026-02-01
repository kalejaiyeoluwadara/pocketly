import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
} from "@/lib/api-helpers";
import BankAccount from "@/models/BankAccount";
import { initiateAccountLinking } from "@/lib/mono";

/**
 * GET /api/bank-accounts
 * List all bank accounts for the authenticated user
 */
export async function GET() {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const bankAccounts = await BankAccount.find({
      userId: user.id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedAccounts = bankAccounts.map((account) => ({
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
    }));

    return NextResponse.json(formattedAccounts);
  } catch (error) {
    return handleApiError(error, "Failed to fetch bank accounts");
  }
}

/**
 * POST /api/bank-accounts
 * This endpoint is no longer used for initiating bank account linking.
 * The Mono Connect Widget is now used directly in the frontend.
 * Keeping this for backward compatibility or alternative flows.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    return NextResponse.json(
      {
        error:
          "This endpoint is deprecated. Please use the Mono Connect Widget in the frontend.",
      },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}
