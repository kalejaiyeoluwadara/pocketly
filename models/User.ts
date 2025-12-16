import mongoose, { Schema, Model } from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  password?: string;
  image?: string;
  provider: "credentials" | "google";
  googleId?: string;
  currentStreak: number;
  lastStreakDate?: Date;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      // Password is optional because Google OAuth users won't have one
      select: false, // Don't return password by default
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStreakDate: {
      type: Date,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes are already created via unique: true on email and googleId fields
// No need to explicitly define them here to avoid duplicate index warnings

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

