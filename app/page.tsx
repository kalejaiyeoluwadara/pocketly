"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useApp } from "./context/AppContext";
import PocketCard from "./components/PocketCard";
import PocketForm from "./components/PocketForm";
import EmptyState from "./components/EmptyState";
import BottomNav from "./components/BottomNav";
import { formatCurrency } from "./utils/currency";
import { Eye, EyeOff, Shield } from "lucide-react";
import { PlusIcon } from "./icons";

export default function Home() {
  const { pockets } = useApp();
  const totalBalance = pockets.reduce((sum, pocket) => sum + pocket.balance, 0);
  const [showBalance, setShowBalance] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-8">
          <nav className="flex items-center mb-4 gap-2 justify-start">
            <div className="h-10 w-10 bg-gray-500 rounded-full"></div>
            <p className="text-md font-medium text-zinc-900 dark:text-zinc-50">
              Hi, <span className="capitalize">OLUWADARA</span>
            </p>
          </nav>
          <div className="rounded-2xl flex justify-between border border-zinc-200/50 bg-white p-6 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
            <section>
              <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center">
                <Shield size={16} className="mr-1" />
                Total Balance
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </p>
              <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                {showBalance ? formatCurrency(totalBalance) : "****"}
              </p>
            </section>
            <section className="flex justify-end items-center">
              <PocketForm />
            </section>
          </div>
        </div>

        <div className="space-y-4">
          {pockets.length === 0 ? (
            <EmptyState
              icon={PlusIcon}
              iconColor="zinc"
              title="No pockets yet"
              description="Create your first pocket to start tracking your finances!"
            />
          ) : (
            <section className="space-y-4">
              {pockets.map((pocket) => (
                <PocketCard key={pocket.id} pocket={pocket} />
              ))}
            </section>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
