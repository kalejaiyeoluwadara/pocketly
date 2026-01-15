import mongoose, { Schema, Model } from "mongoose";

export interface IBankTransaction extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  bankAccountId: mongoose.Types.ObjectId;
  monoTransactionId: string; // Mono's transaction ID for deduplication
  amount: number;
  type: "credit" | "debit";
  description: string;
  category?: string;
  date: Date; // Transaction date from bank
  balance?: number; // Account balance after this transaction
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
      index: true,
    },
    monoTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    balance: {
      type: Number,
    },
    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
BankTransactionSchema.index({ userId: 1, date: -1 });
BankTransactionSchema.index({ bankAccountId: 1, date: -1 });
BankTransactionSchema.index({ userId: 1, type: 1, date: -1 });

const BankTransaction: Model<IBankTransaction> =
  mongoose.models.BankTransaction ||
  mongoose.model<IBankTransaction>("BankTransaction", BankTransactionSchema);

export default BankTransaction;
