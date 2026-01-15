import mongoose, { Schema, Model } from "mongoose";

export interface IBankAccount extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  monoAccountId: string; // Mono's account ID
  monoCode: string; // Authorization code from Mono Connect
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountType?: string; // e.g., "savings", "current"
  currency: string;
  balance?: number; // Last known balance
  isActive: boolean;
  syncStatus: "active" | "expired" | "error";
  lastSyncAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    monoAccountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    monoCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "NGN",
      uppercase: true,
    },
    balance: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    syncStatus: {
      type: String,
      enum: ["active", "expired", "error"],
      default: "active",
      index: true,
    },
    lastSyncAt: {
      type: Date,
    },
    lastError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and active status
BankAccountSchema.index({ userId: 1, isActive: 1 });

const BankAccount: Model<IBankAccount> =
  mongoose.models.BankAccount ||
  mongoose.model<IBankAccount>("BankAccount", BankAccountSchema);

export default BankAccount;
