"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import moment from "moment";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { Priority } from "../types";
import EmptyState from "./EmptyState";
import Mascot from "./Mascot";
import {
  AlertCircleIcon,
  CircleIcon,
  CheckCircleIcon,
} from "../icons";
import { formatCurrency } from "../utils/currency";
import { TrashIcon } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

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
  onEmptyClick?: () => void;
}

export default function NeedsList({
  needs: needsProp,
  onEmptyClick
}: NeedsListProps = {}) {
  const { needs: contextNeeds, deleteNeed, toggleNeedCompletion } = useApp();
  const needs = needsProp || contextNeeds;
  const [needToDelete, setNeedToDelete] = useState<{ id: string; title: string } | null>(null);

  const sortedNeeds = [...needs].sort((a, b) => {
    // Sort by completion status first, then by priority
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  const handleConfirmDelete = async () => {
    if (!needToDelete) return;
    try {
      await deleteNeed(needToDelete.id);
      toast.success("Need deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete need. Please try again.");
    } finally {
      setNeedToDelete(null);
    }
  };

  if (needs.length === 0) {
    return (
      <EmptyState
        title="No needs yet"
        description="Add items you need to save for!"
        onClick={onEmptyClick}
      />
    );
  }

  const allCompleted = needs.every((need) => need.completed);

  return (
    <div className="space-y-2">
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
        >
          <Mascot mood="celebrating" size={56} />
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              All needs sorted!
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You&apos;ve saved for everything on your list.
            </p>
          </div>
        </motion.div>
      )}
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
                  <span className={`text-[10px] font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span>•</span>
                  <span className="text-[10px]">{moment(need.createdAt).format("MMM D, YYYY")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${need.completed ? "line-through text-zinc-500 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                {formatCurrency(need.amount, true)}
              </span>
              <button
                onClick={() => setNeedToDelete({ id: need.id, title: need.title })}
                className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
              >
                <TrashIcon size={13} className="text-zinc-400 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500" />
              </button>
            </div>
          </motion.div>
        );
      })}

      <ConfirmDialog
        isOpen={!!needToDelete}
        onClose={() => setNeedToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Need"
        message={`Are you sure you want to delete "${needToDelete?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
