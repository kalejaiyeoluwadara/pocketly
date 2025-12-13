import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Pocket from "@/models/Pocket";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
  notFoundResponse,
} from "@/lib/api-helpers";

// GET /api/expenses - Get all expenses for authenticated user (optional pocketId filter)
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

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formattedExpenses = expenses.map((expense) => ({
      id: expense._id.toString(),
      pocketId: expense.pocketId.toString(),
      amount: expense.amount,
      description: expense.description,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedExpenses);
  } catch (error) {
    return handleApiError(error, "Failed to fetch expenses");
  }
}

// POST /api/expenses - Create expense and update pocket balance atomically
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

    // Create expense
    const expense = await Expense.create(
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
    pocket.balance -= body.amount;
    await pocket.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        id: expense[0]._id.toString(),
        pocketId: expense[0].pocketId.toString(),
        amount: expense[0].amount,
        description: expense[0].description,
        createdAt: expense[0].createdAt.toISOString(),
        updatedAt: expense[0].updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleApiError(error, "Failed to create expense");
  }
}

