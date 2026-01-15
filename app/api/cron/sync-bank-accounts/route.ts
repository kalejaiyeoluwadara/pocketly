import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/api-helpers";
import { syncAllBankAccounts } from "@/lib/mono-sync";

/**
 * POST /api/cron/sync-bank-accounts
 * Background job endpoint to sync all active bank accounts
 * Can be called by external cron service or Vercel Cron
 * 
 * Optional: Add authentication header check for security
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await syncAllBankAccounts();

    return NextResponse.json({
      message: "Background sync completed",
      accountsProcessed: result.accountsProcessed,
      transactionsAdded: result.totalTransactionsAdded,
      transactionsUpdated: result.totalTransactionsUpdated,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to run background sync");
  }
}
