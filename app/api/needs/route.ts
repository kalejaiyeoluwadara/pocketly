import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Need from "@/models/Need";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  validateRequest,
} from "@/lib/api-helpers";

// GET /api/needs - Get all needs for authenticated user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const needs = await Need.find({ userId: new mongoose.Types.ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .lean();

    const formattedNeeds = needs.map((need) => ({
      id: need._id.toString(),
      title: need.title,
      amount: need.amount,
      priority: need.priority,
      createdAt: need.createdAt.toISOString(),
      updatedAt: need.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedNeeds);
  } catch (error) {
    return handleApiError(error, "Failed to fetch needs");
  }
}

// POST /api/needs - Create new need
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
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

    const need = await Need.create({
      title: body.title,
      amount: body.amount,
      priority: body.priority,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    return NextResponse.json(
      {
        id: need._id.toString(),
        title: need.title,
        amount: need.amount,
        priority: need.priority,
        createdAt: need.createdAt.toISOString(),
        updatedAt: need.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to create need");
  }
}

