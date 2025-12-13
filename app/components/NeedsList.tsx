"use client";

import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Priority } from "../types";
import EmptyState from "./EmptyState";
import {
  AlertCircleIcon,
  CircleIcon,
  CheckCircleIcon,
  PlusIcon,
} from "../icons";
import { formatCurrency } from "../utils/currency";

const priorityConfig: Record<
  Priority,
  { label: string; color: string; icon: typeof AlertCircleIcon }
> = {
  high: {
    label: "High",
    color: "text-red-500",
    icon: AlertCircleIcon,
  },
  medium: {
    label: "Medium",
    color: "text-yellow-500",
    icon: CircleIcon,
  },
  low: {
    label: "Low",
    color: "text-green-500",
    icon: CheckCircleIcon,
  },
};

export default function NeedsList() {
  const { needs, deleteNeed } = useApp();

  const sortedNeeds = [...needs].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (needs.length === 0) {
    return (
      <EmptyState
        icon={PlusIcon}
        iconColor="amber"
        title="No needs yet"
        description="Add items you need to save for!"
      />
    );
  }

  return (
    <div className="space-y-2">
      {sortedNeeds.map((need, index) => {
        const config = priorityConfig[need.priority];
        const Icon = config.icon;

        return (
          <motion.div
            key={need.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-zinc-200/50 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon size={20} className={config.color} />
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {need.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className={`font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span>•</span>
                  <span>{new Date(need.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {formatCurrency(need.amount)}
              </span>
              <button
                onClick={() => deleteNeed(need.id)}
                className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
              >
                Delete
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
