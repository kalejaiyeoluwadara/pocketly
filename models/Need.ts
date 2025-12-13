import mongoose, { Schema, Model } from "mongoose";

export type Priority = "high" | "medium" | "low";

export interface INeed extends mongoose.Document {
  title: string;
  amount: number;
  priority: Priority;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NeedSchema = new Schema<INeed>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
      default: "medium",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Need: Model<INeed> =
  mongoose.models.Need || mongoose.model<INeed>("Need", NeedSchema);

export default Need;

