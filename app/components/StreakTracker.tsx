"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Component that tracks user streak when app is opened
 * - Updates on mount
 * - Checks for new days when app regains visibility
 * 
 * Note: The actual streak checking and updating logic now happens
 * in Nav.tsx when streak data is fetched. This component just ensures
 * a check happens when the user opens or returns to the app.
 */
export default function StreakTracker() {
  const { data: session, status } = useSession();

  const checkAndUpdateStreak = async () => {
    if (status !== "authenticated" || !session) {
      return;
    }

    try {
      // Fetch current streak data
      const response = await fetch("/api/streak");
      if (response.ok) {
        const data = await response.json();
        
        // Check if lastStreakDate is different from today
        const today = new Date().toDateString();
        const lastStreakDate = data.lastStreakDate 
          ? new Date(data.lastStreakDate).toDateString() 
          : null;
        
        // If lastStreakDate is not today, update the streak
        if (lastStreakDate !== today) {
          await fetch("/api/streak", {
            method: "POST",
          });
        }
      }
    } catch (error) {
      // Silently fail - streak tracking shouldn't break the app
      console.error("Failed to check/update streak:", error);
    }
  };

  useEffect(() => {
    // Initial check on mount
    checkAndUpdateStreak();

    // Handle visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndUpdateStreak();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session]);

  return null;
}
