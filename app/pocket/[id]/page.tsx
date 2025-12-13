"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import ExpenseForm from "../../components/ExpenseForm";
import EmptyState from "../../components/EmptyState";
import { WalletIcon, FileTextIcon } from "../../icons";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/currency";
import moment from "moment";
import {  ChevronLeftIcon } from "lucide-react";

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
          <ChevronLeftIcon
            size={30}
            className="text-zinc-500 dark:text-zinc-400"
          />
        </motion.button>

        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-xl bg-indigo-600 p-3 shadow-lg dark:bg-indigo-500">
              <WalletIcon size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-50">
                {pocket.name}
              </h1>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Created{" "}
                {moment(pocket.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-zinc-200/50 bg-white p-5 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900 rounded-2xl">
            <div className=" ">
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Current Balance
              </p>
              <p
                className={`text-xl font-medium ${
                  pocket.balance < 0
                    ? "text-red-500"
                    : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {formatCurrency(pocket.balance)}
              </p>
              <section className="mt-2">
                <ExpenseForm defaultPocketId={pocket.id} />
              </section>
            </div>

            <div className=" ">
              <p className="mb-2 text-xs text-right font-medium text-zinc-500 dark:text-zinc-400">
                Total Spent
              </p>
              <p className="text-xl font-medium text-red-500 text-right">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Expenses{" "}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({pocketExpenses.length})
            </span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete Pocket
          </motion.button>
        </div>

        {pocketExpenses.length === 0 ? (
          <EmptyState
            icon={FileTextIcon}
            iconColor="red"
            title="No expenses yet"
            description="Start tracking expenses for this pocket!"
          />
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
                    {moment(expense.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
                <span className="text-lg font-medium text-red-500">
                  - {formatCurrency(expense.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
