import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Pocket from "@/models/Pocket";
import Expense from "@/models/Expense";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validateRequest,
} from "@/lib/api-helpers";
import { createNotification, formatCurrencyForNotification } from "@/lib/notifications";

// GET /api/pockets/[id] - Get single pocket
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
      return notFoundResponse("Pocket");
    }

    await connectDB();

    const pocket = await Pocket.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();

    if (!pocket) {
      return notFoundResponse("Pocket");
    }

    return NextResponse.json({
      id: pocket._id.toString(),
      name: pocket.name,
      balance: pocket.balance,
      createdAt: pocket.createdAt.toISOString(),
      updatedAt: pocket.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch pocket");
  }
}

// PUT /api/pockets/[id] - Update pocket
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse("Pocket");
    }

    const body = await request.json();
    const validationError = validateRequest(body, ["name"]);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    await connectDB();

    const pocket = await Pocket.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    if (!pocket) {
      return notFoundResponse("Pocket");
    }

    const oldBalance = pocket.balance;
    pocket.name = body.name;
    if (body.balance !== undefined) {
      pocket.balance = body.balance;
    }

    await pocket.save();

    // Create notification if balance goes negative
    if (pocket.balance < 0 && oldBalance >= 0) {
      await createNotification({
        userId: user.id,
        type: "pocket_balance_negative",
        title: "Low Balance Alert",
        message: `Your pocket "${pocket.name}" balance is now negative: ${formatCurrencyForNotification(pocket.balance)}`,
        metadata: {
          pocketId: pocket._id.toString(),
          amount: pocket.balance,
        },
      });
    }

    return NextResponse.json({
      id: pocket._id.toString(),
      name: pocket.name,
      balance: pocket.balance,
      createdAt: pocket.createdAt.toISOString(),
      updatedAt: pocket.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to update pocket");
  }
}

// DELETE /api/pockets/[id] - Delete pocket and cascade delete expenses
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse("Pocket");
    }

    await connectDB();

    const pocket = await Pocket.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    if (!pocket) {
      return notFoundResponse("Pocket");
    }

    const pocketName = pocket.name;

    // Use transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all expenses associated with this pocket
      await Expense.deleteMany(
        { pocketId: params.id },
        { session }
      );

      // Delete the pocket
      await Pocket.deleteOne({ _id: params.id }, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    // Create notification for pocket deletion
    await createNotification({
      userId: user.id,
      type: "pocket_deleted",
      title: "Pocket Deleted",
      message: `You deleted the pocket "${pocketName}"`,
      metadata: {
        pocketId: params.id,
      },
    });

    return NextResponse.json({ message: "Pocket deleted successfully" });
  } catch (error) {
    return handleApiError(error, "Failed to delete pocket");
  }
}

