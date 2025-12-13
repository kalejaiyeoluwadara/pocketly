import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Pocket from "@/models/Pocket";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
  validateRequest,
} from "@/lib/api-helpers";

// GET /api/expenses/[id] - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse("Expense");
    }

    await connectDB();

    const expense = await Expense.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();

    if (!expense) {
      return notFoundResponse("Expense");
    }

    return NextResponse.json({
      id: expense._id.toString(),
      pocketId: expense.pocketId.toString(),
      amount: expense.amount,
      description: expense.description,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch expense");
  }
}

// PUT /api/expenses/[id] - Update expense and adjust pocket balance
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Expense");
    }

    const body = await request.json();
    const validationError = validateRequest(body, ["amount", "description"]);
    if (validationError) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: validationError }, { status: 400 });
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

    const expense = await Expense.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).session(session);

    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Expense");
    }

    const oldAmount = expense.amount;
    const newAmount = body.amount;
    const amountDifference = newAmount - oldAmount;

    // Update expense
    expense.amount = newAmount;
    expense.description = body.description;
    await expense.save({ session });

    // Update pocket balance
    const pocket = await Pocket.findById(expense.pocketId).session(session);
    if (pocket) {
      pocket.balance -= amountDifference;
      await pocket.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      id: expense._id.toString(),
      pocketId: expense.pocketId.toString(),
      amount: expense.amount,
      description: expense.description,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleApiError(error, "Failed to update expense");
  }
}

// DELETE /api/expenses/[id] - Delete expense and restore pocket balance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Expense");
    }

    await connectDB();

    const expense = await Expense.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).session(session);

    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Expense");
    }

    // Restore pocket balance
    const pocket = await Pocket.findById(expense.pocketId).session(session);
    if (pocket) {
      pocket.balance += expense.amount;
      await pocket.save({ session });
    }

    // Delete expense
    await Expense.deleteOne({ _id: params.id }, { session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleApiError(error, "Failed to delete expense");
  }
}
