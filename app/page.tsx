"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useApp } from "./context/AppContext";
import PocketCard from "./components/PocketCard";
import PocketForm, { PocketFormRef } from "./components/PocketForm";
import EmptyState from "./components/EmptyState";
import BottomNav from "./components/BottomNav";
import LoadingModal from "./components/LoadingModal";
import { PlusIcon, Eye, EyeOff, Shield } from "lucide-react";
import Nav from "./components/Nav";
import ContributionGraph from "./components/ContributionGraph";
import Link from "next/link";
import { Building2Icon } from "./icons";

export default function Home() {
  const { pockets, isLoading, bankAccounts } = useApp();
  const totalBalance = pockets.reduce((sum, pocket) => sum + pocket.balance, 0);
  const [showBalance, setShowBalance] = useState(true);
  const pocketFormRef = useRef<PocketFormRef>(null);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <LoadingModal isOpen={isLoading} />
      <Nav />
      <div className="mx-auto max-w-md px-4 py-6">
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
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {showBalance ? (
                  <span className="text-2xl">
                    <span className="text-lg mr-[2px]">₦</span>
                    {totalBalance
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                ) : (
                  <span className="text-2xl">****</span>
                )}
              </p>
            </section>
            <section className="flex justify-end items-center">
              <PocketForm ref={pocketFormRef} />
            </section>
          </div>
        </div>

        {/* Bank Accounts Quick Link */}
        {bankAccounts.length > 0 && (
          <div className="mb-4">
            <Link href="/bank-accounts">
              <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-600 p-2">
                      <Building2Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {bankAccounts.length} Bank Account{bankAccounts.length !== 1 ? "s" : ""} Linked
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        View bank transactions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {pockets.length === 0 ? (
            <EmptyState
              icon={PlusIcon}
              iconColor="zinc"
              title="No pockets yet"
              description="Create your first pocket to start tracking your finances!"
              onClick={() => pocketFormRef.current?.open()}
            />
          ) : (
            <section className="flex flex-col gap-2">
              {pockets.map((pocket) => (
                <PocketCard key={pocket.id} pocket={pocket} />
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
