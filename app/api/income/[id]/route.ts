import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Income from "@/models/Income";
import Pocket from "@/models/Pocket";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
  validateRequest,
} from "@/lib/api-helpers";
import {
  createNotification,
  formatCurrencyForNotification,
} from "@/lib/notifications";

// GET /api/income/[id] - Get single income record
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
      return notFoundResponse("Income");
    }

    await connectDB();

    const income = await Income.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();

    if (!income) {
      return notFoundResponse("Income");
    }

    return NextResponse.json({
      id: income._id.toString(),
      pocketId: income.pocketId.toString(),
      amount: income.amount,
      description: income.description,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch income record");
  }
}

// PUT /api/income/[id] - Update income record and adjust pocket balance
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
      return notFoundResponse("Income");
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

    const income = await Income.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).session(session);

    if (!income) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Income");
    }

    const oldAmount = income.amount;
    const newAmount = body.amount;
    const amountDifference = newAmount - oldAmount;

    // Update income record
    income.amount = newAmount;
    income.description = body.description;
    await income.save({ session });

    // Update pocket balance
    const pocket = await Pocket.findById(income.pocketId).session(session);
    const oldBalance = pocket?.balance || 0;
    if (pocket) {
      pocket.balance += amountDifference;
      await pocket.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Create notification for income update
    if (pocket) {
      await createNotification({
        userId: user.id,
        type: "income_updated",
        title: "Income Updated",
        message: `You updated an income record to ${formatCurrencyForNotification(
          newAmount
        )} for "${body.description}" in "${pocket.name}"`,
        metadata: {
          pocketId: income.pocketId.toString(),
          incomeId: income._id.toString(),
          amount: newAmount,
        },
      });

      // Create notification if balance goes from negative to positive
      if (pocket.balance >= 0 && oldBalance < 0) {
        await createNotification({
          userId: user.id,
          type: "pocket_balance_positive",
          title: "Balance Restored",
          message: `Your pocket "${
            pocket.name
          }" balance is now positive: ${formatCurrencyForNotification(
            pocket.balance
          )}`,
          metadata: {
            pocketId: income.pocketId.toString(),
            amount: pocket.balance,
          },
        });
      }
    }

    return NextResponse.json({
      id: income._id.toString(),
      pocketId: income.pocketId.toString(),
      amount: income.amount,
      description: income.description,
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleApiError(error, "Failed to update income record");
  }
}

// DELETE /api/income/[id] - Delete income record and adjust pocket balance
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
      return notFoundResponse("Income");
    }

    await connectDB();

    const income = await Income.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).session(session);

    if (!income) {
      await session.abortTransaction();
      session.endSession();
      return notFoundResponse("Income");
    }

    // Adjust pocket balance (subtract the income amount)
    const pocket = await Pocket.findById(income.pocketId).session(session);
    if (pocket) {
      pocket.balance -= income.amount;
      await pocket.save({ session });
    }

    const incomeDescription = income.description;
    const incomeAmount = income.amount;
    const pocketName = pocket?.name || "Unknown";

    // Delete income record
    await Income.deleteOne({ _id: params.id }, { session });

    await session.commitTransaction();
    session.endSession();

    // Create notification for income deletion
    await createNotification({
      userId: user.id,
      type: "income_deleted",
      title: "Income Deleted",
      message: `You deleted an income record of ${formatCurrencyForNotification(
        incomeAmount
      )} for "${incomeDescription}" from "${pocketName}"`,
      metadata: {
        pocketId: income.pocketId.toString(),
        incomeId: params.id,
        amount: incomeAmount,
      },
    });

    return NextResponse.json({ message: "Income record deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleApiError(error, "Failed to delete income record");
  }
}

