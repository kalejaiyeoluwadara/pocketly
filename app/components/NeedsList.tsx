"use client";

import { motion } from "framer-motion";
import moment from "moment";
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
import { TrashIcon } from "lucide-react";

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

interface NeedsListProps {
  needs?: any[];
}

export default function NeedsList({ needs: needsProp }: NeedsListProps = {}) {
  const { needs: contextNeeds, deleteNeed, toggleNeedCompletion } = useApp();
  const needs = needsProp || contextNeeds;

  const sortedNeeds = [...needs].sort((a, b) => {
    // Sort by completion status first, then by priority
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
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
        const config = priorityConfig[need.priority as keyof typeof priorityConfig];
        const Icon = config.icon;

        return (
          <motion.div
            key={need.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
              need.completed
                ? "border-zinc-200/30 bg-zinc-50/50 opacity-60 dark:border-zinc-800/30 dark:bg-zinc-900/50"
                : "border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => toggleNeedCompletion(need.id, !need.completed)}
                className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                aria-label={need.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {need.completed ? (
                  <CheckCircleIcon size={20} className="text-green-500" />
                ) : (
                  <CircleIcon size={20} className="text-zinc-300 dark:text-zinc-600" />
                )}
              </button>
              {/* <Icon size={13} className={config.color} /> */}
              <div className="flex-1">
                <p className={`font-medium text-sm ${need.completed ? "line-through text-zinc-500 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                  {need.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className={`text-[8px] font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span>•</span>
                  <span className="text-[8px]">{moment(need.createdAt).format("MMM D, YYYY")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${need.completed ? "line-through text-zinc-500 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                {formatCurrency(need.amount, "6px")}
              </span>
              <button
                onClick={() => deleteNeed(need.id)}
                className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
              >
                <TrashIcon size={13} className="text-zinc-400 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
