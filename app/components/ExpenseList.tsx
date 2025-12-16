"use client";

import { motion } from "framer-motion";
import moment from "moment";
import { useApp } from "../context/AppContext";
import EmptyState from "./EmptyState";
import { PlusIcon } from "../icons";
import { formatCurrency } from "../utils/currency";

export default function ExpenseList() {
  const { expenses, pockets, deleteExpense } = useApp();

  const getPocketName = (pocketId: string) => {
    return pockets.find((p) => p.id === pocketId)?.name || "Unknown";
  };

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={PlusIcon}
        iconColor="red"
        title="No expenses yet"
        description="Start tracking your spending by adding your first expense!"
      />
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between rounded-xl border border-zinc-200/50 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900"
        >
          <div className="flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {expense.description}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{getPocketName(expense.pocketId)}</span>
              <span>•</span>
              <span>{moment(expense.createdAt).format("MMM D, YYYY")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-red-600">
              {formatCurrency(expense.amount, "6px")}
            </span>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
            >
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
