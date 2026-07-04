"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { Priority, Need } from "../types";
import EmptyState from "./EmptyState";
import Mascot from "./Mascot";
import ResponsiveModal from "./ResponsiveModal";
import {
  AlertCircleIcon,
  CircleIcon,
  CheckCircleIcon,
  Loader2Icon,
} from "../icons";
import { formatCurrency } from "../utils/currency";
import { TrashIcon, ShoppingBag } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { suggestCategory, CATEGORY_EMOJI } from "../utils/categories";

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
  needs?: Need[];
  onEmptyClick?: () => void;
}

export default function NeedsList({
  needs: needsProp,
  onEmptyClick,
}: NeedsListProps = {}) {
  const {
    needs: contextNeeds,
    pockets,
    deleteNeed,
    toggleNeedCompletion,
    addExpense,
  } = useApp();
  const needs = needsProp || contextNeeds;
  const [needToDelete, setNeedToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [needToPurchase, setNeedToPurchase] = useState<Need | null>(null);
  const [purchasePocketId, setPurchasePocketId] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const totalBalance = pockets.reduce((sum, p) => sum + p.balance, 0);

  const sortedNeeds = [...needs].sort((a, b) => {
    // Sort by completion status first, then by priority
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder]
    );
  });

  /** Can this planned spend be covered right now, and from where? */
  const getAffordability = (need: Need) => {
    const pocket = need.pocketId
      ? pockets.find((p) => p.id === need.pocketId)
      : null;
    if (pocket) {
      const shortfall = need.amount - pocket.balance;
      return shortfall <= 0
        ? {
            ok: true,
            label: `Covered by ${pocket.name}`,
          }
        : {
            ok: false,
            label: `₦${shortfall.toLocaleString("en-NG", { maximumFractionDigits: 0 })} short in ${pocket.name}`,
          };
    }
    const shortfall = need.amount - totalBalance;
    return shortfall <= 0
      ? { ok: true, label: "Covered by your balance" }
      : {
          ok: false,
          label: `₦${shortfall.toLocaleString("en-NG", { maximumFractionDigits: 0 })} short overall`,
        };
  };

  const openPurchase = (need: Need) => {
    setNeedToPurchase(need);
    setPurchasePocketId(
      need.pocketId && pockets.some((p) => p.id === need.pocketId)
        ? need.pocketId
        : pockets.length === 1
        ? pockets[0].id
        : ""
    );
  };

  const handleConfirmPurchase = async () => {
    if (!needToPurchase || !purchasePocketId || isPurchasing) return;
    setIsPurchasing(true);
    try {
      await addExpense(
        purchasePocketId,
        needToPurchase.amount,
        needToPurchase.title,
        suggestCategory(needToPurchase.title)
      );
      await toggleNeedCompletion(needToPurchase.id, true);
      toast.success(`${needToPurchase.title} — logged and checked off! 🎉`);
      setNeedToPurchase(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to log purchase"
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!needToDelete) return;
    try {
      await deleteNeed(needToDelete.id);
      toast.success("Planned spend deleted!");
    } catch (error) {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setNeedToDelete(null);
    }
  };

  if (needs.length === 0) {
    return (
      <EmptyState
        title="Nothing planned yet"
        description="Add upcoming purchases and Pocketly will tell you when you can afford them."
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
              All planned spends sorted!
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Everything on your list is handled.
            </p>
          </div>
        </motion.div>
      )}
      {sortedNeeds.map((need, index) => {
        const config =
          priorityConfig[need.priority as keyof typeof priorityConfig];
        const affordability = need.completed ? null : getAffordability(need);
        const pocketName = need.pocketId
          ? pockets.find((p) => p.id === need.pocketId)?.name
          : null;

        return (
          <motion.div
            key={need.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
              need.completed
                ? "border-zinc-200/30 bg-zinc-50/50 opacity-60 dark:border-zinc-800/30 dark:bg-zinc-900/50"
                : "border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-3">
                <button
                  onClick={() =>
                    toggleNeedCompletion(need.id, !need.completed)
                  }
                  className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                  aria-label={
                    need.completed ? "Mark as incomplete" : "Mark as complete"
                  }
                >
                  {need.completed ? (
                    <CheckCircleIcon size={20} className="text-green-500" />
                  ) : (
                    <CircleIcon
                      size={20}
                      className="text-zinc-300 dark:text-zinc-600"
                    />
                  )}
                </button>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      need.completed
                        ? "text-zinc-500 line-through dark:text-zinc-500"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {need.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span
                      className={`text-[10px] font-medium ${config.color}`}
                    >
                      {config.label}
                    </span>
                    {pocketName && (
                      <>
                        <span>•</span>
                        <span className="text-[10px]">{pocketName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-[10px]">
                      {moment(need.createdAt).format("MMM D, YYYY")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    need.completed
                      ? "text-zinc-500 line-through dark:text-zinc-500"
                      : "text-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  {formatCurrency(need.amount, true)}
                </span>
                <button
                  onClick={() =>
                    setNeedToDelete({ id: need.id, title: need.title })
                  }
                  className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                >
                  <TrashIcon
                    size={13}
                    className="text-zinc-400 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500"
                  />
                </button>
              </div>
            </div>

            {/* Affordability + purchase action */}
            {affordability && (
              <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
                <p
                  className={`text-[11px] font-medium ${
                    affordability.ok
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {affordability.ok ? "✓ " : ""}
                  {affordability.label}
                </p>
                {affordability.ok && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openPurchase(need)}
                    className="flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <ShoppingBag size={11} />
                    Mark as spent
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Purchase confirmation: logs a real expense and checks the item off */}
      <AnimatePresence>
        {needToPurchase && (
          <ResponsiveModal onClose={() => setNeedToPurchase(null)}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-zinc-900 p-2 dark:bg-zinc-100">
                <ShoppingBag
                  size={20}
                  className="text-white dark:text-zinc-900"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  Mark as spent
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Logs the expense and checks it off your list
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {needToPurchase.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {CATEGORY_EMOJI[suggestCategory(needToPurchase.title)]}{" "}
                  {suggestCategory(needToPurchase.title)}
                </p>
              </div>
              <p className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(needToPurchase.amount, true)}
              </p>
            </div>

            {pockets.length > 1 && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Pay from
                </label>
                <select
                  value={purchasePocketId}
                  onChange={(e) => setPurchasePocketId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="">Select a pocket</option>
                  {pockets.map((pocket) => (
                    <option key={pocket.id} value={pocket.id}>
                      {pocket.name} ({formatCurrency(pocket.balance)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                type="button"
                disabled={isPurchasing}
                whileTap={!isPurchasing ? { scale: 0.98 } : {}}
                onClick={() => setNeedToPurchase(null)}
                className="flex-1 rounded-xl border-2 border-zinc-200 bg-white py-3 font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                disabled={isPurchasing || !purchasePocketId}
                whileTap={!isPurchasing ? { scale: 0.98 } : {}}
                onClick={handleConfirmPurchase}
                className="flex-1 rounded-xl bg-zinc-900 py-3 font-medium text-white transition-all duration-200 hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isPurchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2Icon size={18} className="animate-spin" />
                    Logging...
                  </span>
                ) : (
                  `Spend ₦${needToPurchase.amount.toLocaleString()}`
                )}
              </motion.button>
            </div>
          </ResponsiveModal>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!needToDelete}
        onClose={() => setNeedToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Planned Spend"
        message={`Are you sure you want to delete "${needToDelete?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
