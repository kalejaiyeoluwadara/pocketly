"use client";

import { motion } from "framer-motion";
import { useApp } from "./context/AppContext";
import PocketCard from "./components/PocketCard";
import PocketForm from "./components/PocketForm";
import BottomNav from "./components/BottomNav";
import { formatCurrency } from "./utils/currency";

export default function Home() {
  const { pockets } = useApp();
  const totalBalance = pockets.reduce((sum, pocket) => sum + pocket.balance, 0);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            My Pockets
          </h1>
          <div className="rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
            <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Balance
            </p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totalBalance)}
            </p>
            {totalBalance > 0 && (
              <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ✓ All accounts positive
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <PocketForm />
        </div>

        <div className="space-y-4">
          {pockets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-8 w-8 text-zinc-400"
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
                No pockets yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Create your first pocket to start tracking your finances!
              </p>
            </motion.div>
          ) : (
            pockets.map((pocket) => (
              <PocketCard key={pocket.id} pocket={pocket} />
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
