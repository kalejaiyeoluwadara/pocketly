/**
 * Mono Transaction Sync Utilities
 * Handles syncing transactions from Mono API to database
 */

import connectDB from "./db";
import BankAccount from "@/models/BankAccount";
import BankTransaction from "@/models/BankTransaction";
import {
  getAccountInfo,
  getAccountTransactions,
  getAccountBalance,
} from "./mono";
import mongoose from "mongoose";

export interface SyncResult {
  transactionsAdded: number;
  transactionsUpdated: number;
  errors: string[];
}

/**
 * Sync transactions for a specific bank account
 */
export async function syncAccountTransactions(
  bankAccountId: string
): Promise<SyncResult> {
  await connectDB();

  const account = await BankAccount.findById(bankAccountId);
  if (!account || !account.isActive) {
    throw new Error("Bank account not found or inactive");
  }

  const result: SyncResult = {
    transactionsAdded: 0,
    transactionsUpdated: 0,
    errors: [],
  };

  try {
    // Update account info and balance
    try {
      const accountInfo = await getAccountInfo(account.monoAccountId);
      const balance = await getAccountBalance(account.monoAccountId);

      account.bankName = accountInfo.account.bank.name;
      account.accountNumber = accountInfo.account.accountNumber;
      account.accountName = accountInfo.account.accountName;
      account.accountType = accountInfo.account.type;
      account.currency = accountInfo.account.currency;
      account.balance = balance;
      account.syncStatus = "active";
      account.lastError = undefined;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      account.syncStatus = errorMessage.includes("expired")
        ? "expired"
        : "error";
      account.lastError = errorMessage;
      await account.save();
      result.errors.push(`Failed to fetch account info: ${errorMessage}`);
      return result;
    }

    // Calculate date range (last 90 days or since last sync)
    const endDate = new Date();
    const startDate = account.lastSyncAt
      ? new Date(account.lastSyncAt)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Fetch transactions from Mono
    let page = 1;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      try {
        const transactionsResponse = await getAccountTransactions(
          account.monoAccountId,
          startDate.toISOString(),
          endDate.toISOString(),
          page,
          limit
        );

        const transactions = transactionsResponse.data || [];

        // Process each transaction
        for (const monoTransaction of transactions) {
          try {
            // Check if transaction already exists
            const existingTransaction = await BankTransaction.findOne({
              monoTransactionId: monoTransaction._id,
            });

            if (existingTransaction) {
              // Update existing transaction
              existingTransaction.amount = Math.abs(monoTransaction.amount);
              existingTransaction.type = monoTransaction.type;
              existingTransaction.description =
                monoTransaction.description || "";
              existingTransaction.category = monoTransaction.category;
              existingTransaction.date = new Date(monoTransaction.date);
              existingTransaction.balance = monoTransaction.balance;
              existingTransaction.reference = monoTransaction.reference;
              await existingTransaction.save();
              result.transactionsUpdated++;
            } else {
              // Create new transaction
              await BankTransaction.create({
                userId: account.userId,
                bankAccountId: account._id,
                monoTransactionId: monoTransaction._id,
                amount: Math.abs(monoTransaction.amount),
                type: monoTransaction.type,
                description: monoTransaction.description || "",
                category: monoTransaction.category,
                date: new Date(monoTransaction.date),
                balance: monoTransaction.balance,
                reference: monoTransaction.reference,
              });
              result.transactionsAdded++;
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            result.errors.push(
              `Failed to process transaction ${monoTransaction._id}: ${errorMessage}`
            );
          }
        }

        // Check if there are more pages
        if (transactionsResponse.meta) {
          hasMore = page < transactionsResponse.meta.pages;
          page++;
        } else {
          hasMore = transactions.length === limit;
          page++;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push(
          `Failed to fetch transactions page ${page}: ${errorMessage}`
        );
        hasMore = false;
      }
    }

    // Update account sync status
    account.lastSyncAt = new Date();
    await account.save();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    account.syncStatus = "error";
    account.lastError = errorMessage;
    await account.save();
    result.errors.push(`Sync failed: ${errorMessage}`);
  }

  return result;
}

/**
 * Sync all active bank accounts for a user
 */
export async function syncUserBankAccounts(
  userId: string
): Promise<SyncResult> {
  await connectDB();

  const accounts = await BankAccount.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
  });

  const result: SyncResult = {
    transactionsAdded: 0,
    transactionsUpdated: 0,
    errors: [],
  };

  for (const account of accounts) {
    try {
      const accountResult = await syncAccountTransactions(
        account._id.toString()
      );
      result.transactionsAdded += accountResult.transactionsAdded;
      result.transactionsUpdated += accountResult.transactionsUpdated;
      result.errors.push(...accountResult.errors);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(
        `Failed to sync account ${account._id}: ${errorMessage}`
      );
    }
  }

  return result;
}

/**
 * Sync all active bank accounts (for background jobs)
 */
export async function syncAllBankAccounts(): Promise<{
  accountsProcessed: number;
  totalTransactionsAdded: number;
  totalTransactionsUpdated: number;
  errors: string[];
}> {
  await connectDB();

  const accounts = await BankAccount.find({
    isActive: true,
    syncStatus: "active",
  });

  const summary = {
    accountsProcessed: 0,
    totalTransactionsAdded: 0,
    totalTransactionsUpdated: 0,
    errors: [] as string[],
  };

  for (const account of accounts) {
    try {
      const result = await syncAccountTransactions(account._id.toString());
      summary.accountsProcessed++;
      summary.totalTransactionsAdded += result.transactionsAdded;
      summary.totalTransactionsUpdated += result.transactionsUpdated;
      summary.errors.push(...result.errors);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      summary.errors.push(`Account ${account._id}: ${errorMessage}`);
    }
  }

  return summary;
}
