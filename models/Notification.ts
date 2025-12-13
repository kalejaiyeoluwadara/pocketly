import mongoose, { Schema, Model } from "mongoose";

export type NotificationType =
  | "pocket_created"
  | "pocket_deleted"
  | "pocket_balance_negative"
  | "pocket_balance_positive"
  | "expense_created"
  | "expense_updated"
  | "expense_deleted"
  | "income_created"
  | "income_updated"
  | "income_deleted"
  | "need_created"
  | "need_updated"
  | "need_deleted";

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    pocketId?: string;
    expenseId?: string;
    incomeId?: string;
    needId?: string;
    amount?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "pocket_created",
        "pocket_deleted",
        "pocket_balance_negative",
        "pocket_balance_positive",
        "expense_created",
        "expense_updated",
        "expense_deleted",
        "income_created",
        "income_updated",
        "income_deleted",
        "need_created",
        "need_updated",
        "need_deleted",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

