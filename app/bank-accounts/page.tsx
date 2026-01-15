"use client";

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import BankAccountLink from "../components/BankAccountLink";
import BankAccountList from "../components/BankAccountList";
import BankTransactionList from "../components/BankTransactionList";
import BottomNav from "../components/BottomNav";
import Nav from "../components/Nav";
import EmptyState from "../components/EmptyState";
import { Building2Icon, CreditCardIcon } from "../icons";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function BankAccountsPage() {
  const { bankAccounts, bankTransactions, refreshBankData } = useApp();
  const searchParams = useSearchParams();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if redirected from Mono Connect
    const linked = searchParams.get("linked");
    if (linked === "true") {
      // Handle callback - exchange code for account
      const code = searchParams.get("code");
      if (code) {
        handleMonoCallback(code);
      } else {
        setIsLoading(false);
      }
    } else {
      refreshBankData().finally(() => setIsLoading(false));
    }
  }, []);

  const handleMonoCallback = async (code: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bank-accounts/link/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to link account");
      }

      toast.success("Bank account linked successfully!");
      await refreshBankData();
      
      // Clean up URL
      window.history.replaceState({}, "", "/bank-accounts");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to link account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshBankData();
  };

  const filteredTransactions = selectedAccountId
    ? bankTransactions.filter((t) => t.bankAccountId === selectedAccountId)
    : bankTransactions;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <Nav />
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Bank Accounts
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Link your bank accounts to automatically track transactions
          </p>
        </div>

        <div className="mb-6">
          <BankAccountLink onSuccess={handleRefresh} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>
          </div>
        ) : bankAccounts.length === 0 ? (
          <EmptyState
            icon={Building2Icon}
            iconColor="blue"
            title="No bank accounts linked"
            description="Link your first bank account to start automatically tracking transactions"
            onClick={() => {}}
          />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">
                Linked Accounts
              </h2>
              <BankAccountList accounts={bankAccounts} onRefresh={handleRefresh} />
            </div>

            {bankTransactions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    Bank Transactions
                  </h2>
                  {selectedAccountId && (
                    <button
                      onClick={() => setSelectedAccountId(null)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Show all
                    </button>
                  )}
                </div>
                <BankTransactionList
                  transactions={filteredTransactions}
                  isLoading={isLoading}
                />
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
