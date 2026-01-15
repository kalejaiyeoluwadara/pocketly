import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getAuthenticatedUser, handleApiError, unauthorizedResponse } from "@/lib/api-helpers";
import { syncUserBankAccounts } from "@/lib/mono-sync";

/**
 * POST /api/bank-accounts/sync-all
 * Sync all active bank accounts for the authenticated user
 */
export async function POST() {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const result = await syncUserBankAccounts(user.id);

    return NextResponse.json({
      message: "Sync completed",
      transactionsAdded: result.transactionsAdded,
      transactionsUpdated: result.transactionsUpdated,
      errors: result.errors,
    });
  } catch (error) {
    return handleApiError(error, "Failed to sync bank accounts");
  }
}
