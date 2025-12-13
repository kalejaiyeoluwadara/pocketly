"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Notification } from "../types";
import moment from "moment";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        const newUnreadCount = data.unreadCount || 0;
        setUnreadCount(newUnreadCount);
        onUnreadCountChange?.(newUnreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (isOpen && session) {
      fetchNotifications();
    }
  }, [isOpen, session]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        onUnreadCountChange?.(newUnreadCount);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        onUnreadCountChange?.(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const notification = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.read) {
          const newUnreadCount = Math.max(0, unreadCount - 1);
          setUnreadCount(newUnreadCount);
          onUnreadCountChange?.(newUnreadCount);
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={18} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Loader2 size={20} className="text-zinc-600 dark:text-zinc-400 animate-spin" />
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex items-center justify-center p-6">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                          !notification.read
                            ? "bg-blue-50/50 dark:bg-blue-900/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                              {moment(notification.createdAt).fromNow()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                title="Mark as read"
                              >
                                <Check
                                  size={14}
                                  className="text-zinc-600 dark:text-zinc-400"
                                />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2
                                size={14}
                                className="text-zinc-600 dark:text-zinc-400"
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

