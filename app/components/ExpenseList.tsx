"use client";

import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/currency";

export default function ExpenseList() {
  const { expenses, pockets, deleteExpense } = useApp();

  const getPocketName = (pocketId: string) => {
    return pockets.find((p) => p.id === pocketId)?.name || "Unknown";
  };

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          No expenses yet
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Start tracking your spending by adding your first expense!
        </p>
      </motion.div>
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
              <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-red-500">
              -{formatCurrency(expense.amount)}
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
