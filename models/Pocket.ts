import mongoose, { Schema, Model } from "mongoose";

export interface IPocket extends mongoose.Document {
  name: string;
  balance: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PocketSchema = new Schema<IPocket>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
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

const Pocket: Model<IPocket> =
  mongoose.models.Pocket || mongoose.model<IPocket>("Pocket", PocketSchema);

export default Pocket;

