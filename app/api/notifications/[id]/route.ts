import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-helpers";

// PATCH /api/notifications/[id] - Mark notification as read or unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return notFoundResponse("Notification");
    }

    await connectDB();

    const body = await request.json();
    const read = body.read !== undefined ? body.read : true;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: params.id,
        userId: new mongoose.Types.ObjectId(user.id),
      },
      { read },
      { new: true }
    );

    if (!notification) {
      return notFoundResponse("Notification");
    }

    return NextResponse.json({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata || {},
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to update notification");
  }
}

// DELETE /api/notifications/[id] - Delete notification
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
      return notFoundResponse("Notification");
    }

    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    if (!notification) {
      return notFoundResponse("Notification");
    }

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    return handleApiError(error, "Failed to delete notification");
  }
}

