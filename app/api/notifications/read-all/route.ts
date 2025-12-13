import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-helpers";

// PATCH /api/notifications/read-all - Mark all notifications as read
export async function PATCH() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(user.id),
        read: false,
      },
      { read: true }
    );

    return NextResponse.json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error, "Failed to mark all notifications as read");
  }
}

