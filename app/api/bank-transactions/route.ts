import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getAuthenticatedUser, handleApiError, unauthorizedResponse } from "@/lib/api-helpers";
import BankTransaction from "@/models/BankTransaction";
import mongoose from "mongoose";

/**
 * GET /api/bank-transactions
 * List bank transactions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const bankAccountId = searchParams.get("bankAccountId");
    const type = searchParams.get("type") as "credit" | "debit" | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {
      userId: new mongoose.Types.ObjectId(user.id),
    };

    if (bankAccountId && mongoose.Types.ObjectId.isValid(bankAccountId)) {
      query.bankAccountId = new mongoose.Types.ObjectId(bankAccountId);
    }

    if (type && (type === "credit" || type === "debit")) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const total = await BankTransaction.countDocuments(query);

    // Fetch transactions
    const transactions = await BankTransaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("bankAccountId", "bankName accountNumber accountName")
      .lean();

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction._id.toString(),
      userId: transaction.userId.toString(),
      bankAccountId: transaction.bankAccountId.toString(),
      bankAccount: transaction.bankAccountId && typeof transaction.bankAccountId === "object"
        ? {
            bankName: (transaction.bankAccountId as any).bankName,
            accountNumber: (transaction.bankAccountId as any).accountNumber,
            accountName: (transaction.bankAccountId as any).accountName,
          }
        : null,
      monoTransactionId: transaction.monoTransactionId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date.toISOString(),
      balance: transaction.balance,
      reference: transaction.reference,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: formattedTransactions,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch bank transactions");
  }
}
