"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useApp } from "./context/AppContext";
import PocketCard from "./components/PocketCard";
import PocketForm, { PocketFormRef } from "./components/PocketForm";
import EmptyState from "./components/EmptyState";
import BottomNav from "./components/BottomNav";
import SideNav from "./components/SideNav";
import LoadingModal from "./components/LoadingModal";
import { formatCurrency } from "./utils/currency";
import { Eye, EyeOff, Shield } from "lucide-react";
import Nav from "./components/Nav";
import ContributionGraph from "./components/ContributionGraph";
import { useAnimatedNavigate } from "./utils/useAnimatedNavigate";
import MascotBuddy from "./components/MascotBuddy";

export default function Home() {
  const { pockets, isLoading } = useApp();
  const totalBalance = pockets.reduce((sum, pocket) => sum + pocket.balance, 0);
  const [showBalance, setShowBalance] = useState(true);
  const pocketFormRef = useRef<PocketFormRef>(null);
  const { leavingKey, navigate } = useAnimatedNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black lg:pb-6 lg:pl-56">
      <LoadingModal isOpen={isLoading} />
      <SideNav />
      <Nav />
      <div className="mx-auto max-w-md lg:max-w-4xl px-4 py-6">
        <div className="mb-8">
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
              <p className="font-display font-bold text-zinc-900 dark:text-zinc-50">
                {showBalance ? (
                  <span className="text-3xl">
                    {formatCurrency(totalBalance)}
                  </span>
                ) : (
                  <span className="text-3xl">****</span>
                )}
              </p>
            </section>
            <section className="flex justify-end items-center">
              <PocketForm ref={pocketFormRef} />
            </section>
          </div>
        </div>

        <MascotBuddy />

        <div className="space-y-4">
          {pockets.length === 0 ? (
            <EmptyState
              title="No pockets yet"
              description="Create your first pocket to start tracking your finances!"
              onClick={() => pocketFormRef.current?.open()}
            />
          ) : (
            <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {pockets.map((pocket) => (
                <PocketCard
                  key={pocket.id}
                  pocket={pocket}
                  onPress={navigate}
                  leaving={leavingKey === pocket.id}
                  dimmed={leavingKey !== null && leavingKey !== pocket.id}
                />
              ))}
            </section>
          )}
        </div>

        {/* Activity Graph */}
        <div className="mt-8">
          <ContributionGraph />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
