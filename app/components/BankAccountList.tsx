"use client";

import { motion } from "framer-motion";
import { BankAccount } from "../types";
import { Building2Icon, CreditCardIcon } from "../icons";
import { formatCurrency } from "../utils/currency";
import BankSyncStatus from "./BankSyncStatus";
import { useState } from "react";
import { toast } from "sonner";
import { RefreshCwIcon, UnlinkIcon, Loader2Icon } from "../icons";
import { useApp } from "../context/AppContext";

interface BankAccountListProps {
  accounts: BankAccount[];
  onRefresh?: () => void;
}

export default function BankAccountList({ accounts, onRefresh }: BankAccountListProps) {
  const { unlinkBankAccount, syncBankAccount } = useApp();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const handleSync = async (accountId: string) => {
    try {
      setSyncingId(accountId);
      await syncBankAccount(accountId);
      toast.success("Account synced successfully");
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sync account");
    } finally {
      setSyncingId(null);
    }
  };

  const handleUnlink = async (accountId: string) => {
    if (!confirm("Are you sure you want to unlink this bank account?")) {
      return;
    }

    try {
      setUnlinkingId(accountId);
      await unlinkBankAccount(accountId);
      toast.success("Bank account unlinked successfully");
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unlink account");
    } finally {
      setUnlinkingId(null);
    }
  };

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <motion.div
          key={account.id}
          whileHover={{ scale: 1.01, y: -1 }}
          className="rounded-xl border border-zinc-200/50 bg-white p-4 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <Building2Icon size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                    {account.bankName}
                  </h3>
                  <BankSyncStatus status={account.syncStatus} lastSyncAt={account.lastSyncAt} />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  {account.accountName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {account.accountNumber}
                </p>
                {account.balance !== undefined && (
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mt-2">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                )}
                {account.lastError && (
                  <p className="text-xs text-red-500 mt-1">{account.lastError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => handleSync(account.id)}
                disabled={syncingId === account.id}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                title="Sync transactions"
              >
                {syncingId === account.id ? (
                  <Loader2Icon size={16} className="animate-spin text-zinc-600 dark:text-zinc-400" />
                ) : (
                  <RefreshCwIcon size={16} className="text-zinc-600 dark:text-zinc-400" />
                )}
              </button>
              <button
                onClick={() => handleUnlink(account.id)}
                disabled={unlinkingId === account.id}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                title="Unlink account"
              >
                {unlinkingId === account.id ? (
                  <Loader2Icon size={16} className="animate-spin text-red-600" />
                ) : (
                  <UnlinkIcon size={16} className="text-red-600" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
