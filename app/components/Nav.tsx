"use client";

import React, { useState } from "react";
import { LogOut, Bell, User2Icon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import LogoutModal from "./LogoutModal";

function Nav() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { data: session } = useSession();

  const handleSignOutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

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
            Hi, <span className="uppercase">{userName.split(" ")[0].slice(0, 10)}</span>
          </p>
        </section>
        <section className="flex items-center gap-2">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell size={20} className="text-zinc-900 dark:text-zinc-50" />
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

      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm border-l border-zinc-200/50 bg-white/95 backdrop-blur-xl shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900/95"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200/50 p-4 dark:border-zinc-800/50">
                  <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
                    Notifications
                  </h2>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X size={18} className="text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No notifications yet
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
}

export default Nav;
