"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Component that tracks user streak when app is opened
 * Runs once per session on mount
 */
export default function StreakTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only track streak if user is authenticated
    if (status === "authenticated" && session) {
      // Update streak when app is opened
      fetch("/api/streak", {
        method: "POST",
      }).catch((error) => {
        // Silently fail - streak tracking shouldn't break the app
        console.error("Failed to update streak:", error);
      });
    }
  }, []);

  return null;
}
