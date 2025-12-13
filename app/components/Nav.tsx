"use client";

import React, { useState, useEffect } from "react";
import { LogOut, Bell, User2Icon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import LogoutModal from "./LogoutModal";
import NotificationsPanel from "./NotificationsPanel";

function Nav() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  return (
    <>
      <nav className="flex items-center gap-2 justify-between px-4 py-b pt-4">
        <section className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-500 flex items-center justify-center rounded-full">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User2Icon size={20} className="text-white" />
            )}
          </div>
          <p className="text-md font-medium text-zinc-900 dark:text-zinc-50">
            Hi,{" "}
            <span className="uppercase">
              {userName.split(" ")[0].slice(0, 10)}
            </span>
          </p>
        </section>
        <section className="flex items-center gap-2">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell size={20} className="text-zinc-900 dark:text-zinc-50" />
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
            <LogOut size={20} className="text-zinc-900 dark:text-zinc-50" />
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
