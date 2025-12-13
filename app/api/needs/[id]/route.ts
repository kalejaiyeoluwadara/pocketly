import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Need from "@/models/Need";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
  validateRequest,
} from "@/lib/api-helpers";
import { createNotification, formatCurrencyForNotification } from "@/lib/notifications";

// GET /api/needs/[id] - Get single need
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
      return notFoundResponse("Need");
    }

    await connectDB();

    const need = await Need.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();

    if (!need) {
      return notFoundResponse("Need");
    }

    return NextResponse.json({
      id: need._id.toString(),
      title: need.title,
      amount: need.amount,
      priority: need.priority,
      createdAt: need.createdAt.toISOString(),
      updatedAt: need.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch need");
  }
}

// PUT /api/needs/[id] - Update need
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
      return notFoundResponse("Need");
    }

    const body = await request.json();
    const validationError = validateRequest(body, ["title", "amount", "priority"]);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!["high", "medium", "low"].includes(body.priority)) {
      return NextResponse.json(
        { error: "Priority must be high, medium, or low" },
        { status: 400 }
      );
    }

    await connectDB();

    const need = await Need.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    if (!need) {
      return notFoundResponse("Need");
    }

    need.title = body.title;
    need.amount = body.amount;
    need.priority = body.priority;

    await need.save();

    // Create notification for need update
    await createNotification({
      userId: user.id,
      type: "need_updated",
      title: "Need Updated",
      message: `You updated a need: "${need.title}" (${need.priority} priority) - ${formatCurrencyForNotification(need.amount)}`,
      metadata: {
        needId: need._id.toString(),
        amount: need.amount,
      },
    });

    return NextResponse.json({
      id: need._id.toString(),
      title: need.title,
      amount: need.amount,
      priority: need.priority,
      createdAt: need.createdAt.toISOString(),
      updatedAt: need.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to update need");
  }
}

// DELETE /api/needs/[id] - Delete need
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
      return notFoundResponse("Need");
    }

    await connectDB();

    const need = await Need.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    if (!need) {
      return notFoundResponse("Need");
    }

    const needTitle = need.title;
    const needAmount = need.amount;

    await Need.deleteOne({ _id: params.id });

    // Create notification for need deletion
    await createNotification({
      userId: user.id,
      type: "need_deleted",
      title: "Need Deleted",
      message: `You deleted a need: "${needTitle}" - ${formatCurrencyForNotification(needAmount)}`,
      metadata: {
        needId: params.id,
        amount: needAmount,
      },
    });

    return NextResponse.json({ message: "Need deleted successfully" });
  } catch (error) {
    return handleApiError(error, "Failed to delete need");
  }
}

