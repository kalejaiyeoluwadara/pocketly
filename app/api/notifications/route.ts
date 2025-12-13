import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-helpers";

// GET /api/notifications - Get all notifications for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const query: any = { userId: new mongoose.Types.ObjectId(user.id) };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50) // Limit to 50 most recent notifications
      .lean();

    const formattedNotifications = notifications.map((notification) => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata || {},
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    }));

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(user.id),
      read: false,
    });

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch notifications");
  }
}

