import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Pocket from "@/models/Pocket";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
} from "@/lib/api-helpers";
import { createNotification, formatCurrencyForNotification } from "@/lib/notifications";

// GET /api/pockets - Get all pockets for authenticated user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const pockets = await Pocket.find({ userId: new mongoose.Types.ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .lean();

    const formattedPockets = pockets.map((pocket) => ({
      id: pocket._id.toString(),
      name: pocket.name,
      balance: pocket.balance,
      createdAt: pocket.createdAt.toISOString(),
      updatedAt: pocket.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedPockets);
  } catch (error) {
    return handleApiError(error, "Failed to fetch pockets");
  }
}

// POST /api/pockets - Create new pocket
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
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

    const pocket = await Pocket.create({
      name: body.name,
      balance: body.balance || 0,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    // Create notification for pocket creation
    await createNotification({
      userId: user.id,
      type: "pocket_created",
      title: "Pocket Created",
      message: `You created a new pocket "${pocket.name}" with balance ${formatCurrencyForNotification(pocket.balance)}`,
      metadata: {
        pocketId: pocket._id.toString(),
        amount: pocket.balance,
      },
    });

    return NextResponse.json(
      {
        id: pocket._id.toString(),
        name: pocket.name,
        balance: pocket.balance,
        createdAt: pocket.createdAt.toISOString(),
        updatedAt: pocket.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to create pocket");
  }
}

