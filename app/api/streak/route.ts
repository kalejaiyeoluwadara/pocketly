import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";
import {
  getAuthenticatedUser,
  handleApiError,
  unauthorizedResponse,
} from "@/lib/api-helpers";

// GET /api/streak - Get user's streak data
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const userDoc = await User.findById(new mongoose.Types.ObjectId(user.id))
      .select("currentStreak lastStreakDate longestStreak")
      .lean();

    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      currentStreak: userDoc.currentStreak || 0,
      lastStreakDate: userDoc.lastStreakDate
        ? userDoc.lastStreakDate.toISOString()
        : null,
      longestStreak: userDoc.longestStreak || 0,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch streak data");
  }
}

// POST /api/streak - Update streak when app is opened
export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const userDoc = await User.findById(new mongoose.Types.ObjectId(user.id));
    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // If lastStreakDate doesn't exist, this is the first time
    if (!userDoc.lastStreakDate) {
      userDoc.currentStreak = 1;
      userDoc.lastStreakDate = today;
      userDoc.longestStreak = Math.max(userDoc.longestStreak || 0, 1);
      await userDoc.save();
      
      return NextResponse.json({
        currentStreak: userDoc.currentStreak,
        lastStreakDate: userDoc.lastStreakDate.toISOString(),
        longestStreak: userDoc.longestStreak,
        streakUpdated: true,
      });
    }

    const lastStreakDate = new Date(userDoc.lastStreakDate);
    const lastStreakDay = new Date(
      lastStreakDate.getFullYear(),
      lastStreakDate.getMonth(),
      lastStreakDate.getDate()
    );

    // Calculate days difference
    const daysDiff = Math.floor(
      (today.getTime() - lastStreakDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    let streakUpdated = false;

    if (daysDiff === 0) {
      // Already opened today, no update needed
      streakUpdated = false;
    } else if (daysDiff === 1) {
      // Opened yesterday, continue streak
      userDoc.currentStreak = (userDoc.currentStreak || 0) + 1;
      userDoc.lastStreakDate = today;
      userDoc.longestStreak = Math.max(
        userDoc.longestStreak || 0,
        userDoc.currentStreak
      );
      streakUpdated = true;
    } else {
      // More than 1 day ago, reset streak
      userDoc.currentStreak = 1;
      userDoc.lastStreakDate = today;
      userDoc.longestStreak = Math.max(userDoc.longestStreak || 0, 1);
      streakUpdated = true;
    }

    await userDoc.save();

    return NextResponse.json({
      currentStreak: userDoc.currentStreak,
      lastStreakDate: userDoc.lastStreakDate.toISOString(),
      longestStreak: userDoc.longestStreak,
      streakUpdated,
    });
  } catch (error) {
    return handleApiError(error, "Failed to update streak");
  }
}

