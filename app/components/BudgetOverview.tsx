"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import moment from "moment";
import { Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getPocketPace } from "../utils/pace";
import { formatCurrency } from "../utils/currency";
import UpdatePocketModal from "./UpdatePocketModal";
import { Pocket } from "../types";

const paceColors = {
  "on-track": {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  tight: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  over: { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },
} as const;

/**
 * The month at a glance: total budgeted vs spent, then each pocket's pace.
 * Pockets without a budget get a one-tap "Set budget" path so adopting
 * budgets never requires hunting through settings.
 */
export default function BudgetOverview() {
  const { pockets, expenses, updatePocket } = useApp();
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);

  const now = new Date();
  const budgeted = pockets
    .map((p) => ({ pocket: p, pace: getPocketPace(p, expenses, now) }))
    .filter(
      (x): x is { pocket: Pocket; pace: NonNullable<ReturnType<typeof getPocketPace>> } =>
        x.pace !== null
    );
  const unbudgeted = pockets.filter((p) => !p.monthlyBudget);

  const totalBudget = budgeted.reduce((sum, x) => sum + x.pace.budget, 0);
  const totalSpent = budgeted.reduce(
    (sum, x) => sum + x.pace.spentThisMonth,
    0
  );
  const overallRatio = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const overallStatus =
    totalSpent > totalBudget
      ? "over"
      : overallRatio > now.getDate() / moment(now).daysInMonth() + 0.1
      ? "tight"
      : "on-track";

  return (
    <div className="mb-6 space-y-4">
      {/* Month summary */}
      <div className="rounded-2xl border border-zinc-200/50 bg-white p-5 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {moment(now).format("MMMM")} budget
          </p>
          {totalBudget > 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {budgeted.length} pocket{budgeted.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {totalBudget > 0 ? (
          <>
            <p className="mt-1 font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totalSpent, true)}
              <span className="text-base font-medium text-zinc-400 dark:text-zinc-500">
                {" "}
                / {formatCurrency(totalBudget, true)}
              </span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, overallRatio * 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${paceColors[overallStatus].bar}`}
              />
            </div>
            <p
              className={`mt-2 text-xs font-medium ${paceColors[overallStatus].text}`}
            >
              {totalSpent <= totalBudget
                ? `₦${(totalBudget - totalSpent).toLocaleString("en-NG", { maximumFractionDigits: 0 })} left · ${
                    moment(now).daysInMonth() - now.getDate()
                  } days to go`
                : `₦${(totalSpent - totalBudget).toLocaleString("en-NG", { maximumFractionDigits: 0 })} over budget this month`}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            No budgets yet. Give a pocket a monthly budget below and Pocketly
            will track your pace against it every day.
          </p>
        )}
      </div>

      {/* Per-pocket pace */}
      {budgeted.length > 0 && (
        <div className="space-y-2">
          {budgeted.map(({ pocket, pace }, index) => (
            <motion.button
              key={pocket.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setEditingPocket(pocket)}
              className="block w-full rounded-xl border border-zinc-200/50 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                  {pocket.name}
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(pace.spentThisMonth, true)}
                  <span className="font-normal text-zinc-400 dark:text-zinc-500">
                    {" "}
                    / {formatCurrency(pace.budget, true)}
                  </span>
                </p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, pace.usedRatio * 100)}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${paceColors[pace.status].bar}`}
                />
              </div>
              <p
                className={`mt-1.5 text-[11px] font-medium ${paceColors[pace.status].text}`}
              >
                {pace.summary}
              </p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Pockets still without a budget */}
      {unbudgeted.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            No budget yet
          </p>
          <div className="flex flex-wrap gap-2">
            {unbudgeted.map((pocket) => (
              <button
                key={pocket.id}
                onClick={() => setEditingPocket(pocket)}
                className="flex items-center gap-1 rounded-full border border-dashed border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
              >
                <Plus size={12} />
                {pocket.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {editingPocket && (
        <UpdatePocketModal
          isOpen={!!editingPocket}
          onClose={() => setEditingPocket(null)}
          pocket={editingPocket}
          onUpdate={updatePocket}
        />
      )}
    </div>
  );
}
