"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import ExpenseForm from "../../components/ExpenseForm";
import ExpenseList from "../../components/ExpenseList";
import { WalletIcon } from "../../icons";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/currency";

export default function PocketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { pockets, expenses, deletePocket } = useApp();
  const pocket = pockets.find((p) => p.id === params.id);

  if (!pocket) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
        <div className="mx-auto max-w-md px-4 py-6">
          <p className="text-zinc-500 dark:text-zinc-400">Pocket not found</p>
        </div>
      </div>
    );
  }

  const pocketExpenses = expenses.filter((e) => e.pocketId === pocket.id);
  const totalSpent = pocketExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this pocket?")) {
      deletePocket(pocket.id);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <div className="mx-auto max-w-md px-4 py-6">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </motion.button>

        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-xl bg-indigo-600 p-3 shadow-lg dark:bg-indigo-500">
              <WalletIcon size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {pocket.name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Created{" "}
                {new Date(pocket.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-200/50 bg-white p-5 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Current Balance
              </p>
              <p
                className={`text-2xl font-bold ${
                  pocket.balance < 0
                    ? "text-red-500"
                    : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {formatCurrency(pocket.balance)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/50 bg-white p-5 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <ExpenseForm defaultPocketId={pocket.id} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Expenses ({pocketExpenses.length})
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </motion.button>
        </div>

        {pocketExpenses.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              No expenses yet
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Start tracking expenses for this pocket!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {pocketExpenses.map((expense, index) => (
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
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-lg font-semibold text-red-500">
                  -{formatCurrency(expense.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
