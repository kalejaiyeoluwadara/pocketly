"use client";

import { motion } from "framer-motion";
import { BankTransaction } from "../types";
import { TrendingUpIcon, TrendingDownIcon } from "../icons";
import { formatCurrency } from "../utils/currency";
import moment from "moment";
import EmptyState from "./EmptyState";
import { FileTextIcon } from "../icons";

interface BankTransactionListProps {
  transactions: BankTransaction[];
  isLoading?: boolean;
}

export default function BankTransactionList({
  transactions,
  isLoading = false,
}: BankTransactionListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading transactions...
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={FileTextIcon}
        iconColor="zinc"
        title="No bank transactions yet"
        description="Bank transactions will appear here after syncing your account"
      />
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isCredit = transaction.type === "credit";
        const Icon = isCredit ? TrendingUpIcon : TrendingDownIcon;
        const iconColor = isCredit ? "text-green-500" : "text-red-500";

        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-zinc-200/50 bg-white p-4 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`rounded-lg p-2 ${
                    isCredit
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                    {transaction.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const bankAccount = (transaction as any).bankAccount;
                      return bankAccount &&
                        typeof bankAccount === "object" &&
                        "bankName" in bankAccount ? (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {bankAccount.bankName}
                        </span>
                      ) : null;
                    })()}
                    {transaction.category && (
                      <>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {transaction.category}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {moment(transaction.date).format("MMM D, YYYY • h:mm A")}
                  </p>
                  {transaction.reference && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1">
                      Ref: {transaction.reference}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p
                  className={`text-sm font-medium ${
                    isCredit
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(transaction.amount, "NGN")}
                </p>
                {transaction.balance !== undefined && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Balance: {formatCurrency(transaction.balance, "NGN")}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
