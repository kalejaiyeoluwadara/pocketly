import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Income from "@/models/Income";
import Pocket from "@/models/Pocket";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
  notFoundResponse,
} from "@/lib/api-helpers";
import { createNotification, formatCurrencyForNotification } from "@/lib/notifications";

// GET /api/income - Get all income records for authenticated user (optional pocketId filter)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const pocketId = searchParams.get("pocketId");

    const query: any = { userId: new mongoose.Types.ObjectId(user.id) };
    if (pocketId && mongoose.Types.ObjectId.isValid(pocketId)) {
      query.pocketId = new mongoose.Types.ObjectId(pocketId);
    }

    const incomeRecords = await Income.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formattedIncome = incomeRecords.map((income) => ({
      id: income._id.toString(),
      pocketId: income.pocketId.toString(),
      amount: income.amount,
      description: income.description,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedIncome);
  } catch (error) {
    return handleApiError(error, "Failed to fetch income records");
  }
}

// POST /api/income - Create income record and update pocket balance atomically
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validationError = validateRequest(body, [
      "pocketId",
      "amount",
      "description",
    ]);
    if (validationError) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.pocketId)) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Pocket");
    }

    if (body.amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify pocket exists and belongs to user
    const pocket = await Pocket.findOne({
      _id: body.pocketId,
      userId: new mongoose.Types.ObjectId(user.id),
    }).session(session);

    if (!pocket) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Pocket");
    }

    // Create income record
    const income = await Income.create(
      [
        {
          pocketId: new mongoose.Types.ObjectId(body.pocketId),
          amount: body.amount,
          description: body.description,
          userId: new mongoose.Types.ObjectId(user.id),
        },
      ],
      { session }
    );

    // Update pocket balance
    const oldBalance = pocket.balance;
    pocket.balance += body.amount;
    await pocket.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Create notification for income creation
    await createNotification({
      userId: user.id,
      type: "income_created",
      title: "Income Recorded",
      message: `You recorded an income of ${formatCurrencyForNotification(body.amount)} for "${body.description}" in "${pocket.name}"`,
      metadata: {
        pocketId: income[0].pocketId.toString(),
        incomeId: income[0]._id.toString(),
        amount: body.amount,
      },
    });

    // Create notification if balance goes from negative to positive
    if (pocket.balance >= 0 && oldBalance < 0) {
      await createNotification({
        userId: user.id,
        type: "pocket_balance_positive",
        title: "Balance Restored",
        message: `Your pocket "${pocket.name}" balance is now positive: ${formatCurrencyForNotification(pocket.balance)}`,
        metadata: {
          pocketId: income[0].pocketId.toString(),
          amount: pocket.balance,
        },
      });
    }

    return NextResponse.json(
      {
        id: income[0]._id.toString(),
        pocketId: income[0].pocketId.toString(),
        amount: income[0].amount,
        description: income[0].description,
        createdAt: income[0].createdAt.toISOString(),
        updatedAt: income[0].updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleApiError(error, "Failed to create income record");
  }
}

