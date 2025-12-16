"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Trash2, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "../types";
import moment from "moment";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

type NotificationCategory = "all" | "pockets" | "expenses" | "income" | "needs";

const categoryConfig: Record<
  NotificationCategory,
  {
    label: string;
    types: NotificationType[];
  }
> = {
  all: {
    label: "All",
    types: [],
  },
  pockets: {
    label: "Pockets",
    types: [
      "pocket_created",
      "pocket_deleted",
      "pocket_balance_negative",
      "pocket_balance_positive",
    ],
  },
  expenses: {
    label: "Expenses",
    types: ["expense_created", "expense_updated", "expense_deleted"],
  },
  income: {
    label: "Income",
    types: ["income_created", "income_updated", "income_deleted"],
  },
  needs: {
    label: "Needs",
    types: ["need_created", "need_updated", "need_deleted"],
  },
};

export default function NotificationsPanel({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>("all");
  const { data: session } = useSession();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

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
    // Set up polling when session is available
    if (session?.user?.id && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Initial fetch
      fetchNotifications();
      // Set up polling for new notifications every 2 minutes
      pollingIntervalRef.current = setInterval(fetchNotifications, 120000);
    }

    // Clean up when session is lost
    if (!session?.user?.id && hasInitializedRef.current) {
      hasInitializedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [session?.user?.id]); // Use stable user ID instead of entire session object

  useEffect(() => {
    if (isOpen && session) {
      fetchNotifications();
    }
  }, [isOpen]); // Only depend on isOpen, not session

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

  // Filter notifications by selected category
  const filteredNotifications = useMemo(() => {
    if (selectedCategory === "all") {
      return notifications;
    }
    const categoryTypes = categoryConfig[selectedCategory].types;
    return notifications.filter((notification) =>
      categoryTypes.includes(notification.type)
    );
  }, [notifications, selectedCategory]);

  // Get count for each category
  const getCategoryCount = (category: NotificationCategory): number => {
    if (category === "all") {
      return notifications.length;
    }
    const categoryTypes = categoryConfig[category].types;
    return notifications.filter((notification) =>
      categoryTypes.includes(notification.type)
    ).length;
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
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm pb-8"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-sm border-l border-zinc-200/50 bg-white/95 backdrop-blur-xl shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900/95"
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
              {/* Category Filter */}
              <div className="border-b border-zinc-200/50 px-4 py-3 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {(Object.keys(categoryConfig) as NotificationCategory[]).map(
                    (category) => {
                      const config = categoryConfig[category];
                      const count = getCategoryCount(category);
                      const isActive = selectedCategory === category;

                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                            isActive
                              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          }`}
                        >
                          <span>{config.label}</span>
                          {count > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                isActive
                                  ? "bg-white/20 dark:bg-zinc-900/20"
                                  : "bg-zinc-200 dark:bg-zinc-700"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Loader2
                        size={20}
                        className="text-zinc-600 dark:text-zinc-400 animate-spin"
                      />
                    </p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex items-center justify-center p-6">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {notifications.length === 0
                        ? "No notifications yet"
                        : `No ${categoryConfig[
                            selectedCategory
                          ].label.toLowerCase()} notifications`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {filteredNotifications.map((notification) => (
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
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
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
