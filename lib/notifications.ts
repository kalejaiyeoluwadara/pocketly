import mongoose from "mongoose";
import connectDB from "./db";
import Notification, { NotificationType } from "@/models/Notification";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    pocketId?: string;
    expenseId?: string;
    needId?: string;
    amount?: number;
    [key: string]: any;
  };
}

/**
 * Create a notification for a user
 * This function is non-blocking and won't throw errors to avoid breaking the main flow
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  try {
    await connectDB();

    await Notification.create({
      userId: new mongoose.Types.ObjectId(params.userId),
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
      read: false,
    });
  } catch (error) {
    // Log error but don't throw - notifications shouldn't break the main flow
    console.error("Failed to create notification:", error);
  }
}

/**
 * Format currency for notification messages
 */
export function formatCurrencyForNotification(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

