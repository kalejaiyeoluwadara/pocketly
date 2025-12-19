"use client";

import React, { useState, useEffect } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import LogoutModal from "./LogoutModal";
import NotificationsPanel from "./NotificationsPanel";
import { FlameIcon } from "../icons";
import Image from "next/image";
function Nav() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const { data: session } = useSession();

  const handleSignOutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

  // Fetch initial unread count
  useEffect(() => {
    if (session) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch("/api/notifications?unreadOnly=true");
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      };

      fetchUnreadCount();
      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Fetch streak data
  useEffect(() => {
    if (session) {
      const fetchAndUpdateStreak = async () => {
        try {
          // First, fetch current streak data
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
              const updateResponse = await fetch("/api/streak", {
                method: "POST",
              });

              if (updateResponse.ok) {
                const updatedData = await updateResponse.json();
                setCurrentStreak(updatedData.currentStreak || 0);
                return;
              }
            }

            // Otherwise, just use the fetched data
            setCurrentStreak(data.currentStreak || 0);
          }
        } catch (error) {
          console.error("Failed to fetch/update streak:", error);
        }
      };

      // Initial fetch and update on mount
      fetchAndUpdateStreak();
    }
  }, [session]);

  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  return (
    <>
      <nav className="flex max-w-md mx-auto items-center gap-2 justify-between px-4 py-b pt-4">
        <section className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-500 flex items-center justify-center rounded-full">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={userName}
                className=" rounded-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Hi,{" "}
            <span className="uppercase">
              {userName.split(" ")[0].slice(0, 10)}
            </span>
          </p>
        </section>
        <section className="flex items-center gap-2">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30  dark:border-orange-900/50">
              <FlameIcon
                size={18}
                className="text-orange-500 dark:text-orange-400"
                fill="currentColor"
              />
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {currentStreak}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-0 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleSignOutClick}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
          </button>
        </section>
      </nav>

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
}

export default Nav;
