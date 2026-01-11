"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3Icon } from "lucide-react";
import TransactionItem from "./TransactionItem";
import BalanceHistoryChart from "./BalanceHistoryChart";
import EmptyState from "./EmptyState";
import { FileTextIcon } from "../icons";

interface Expense {
  id: string;
  amount: number;
  createdAt: string;
  description: string;
  pocketId: string;
}

interface Income {
  id: string;
  amount: number;
  createdAt: string;
  description: string;
  pocketId: string;
}

interface Pocket {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

interface TransactionListProps {
  pocket: Pocket;
  expenses: Expense[];
  income: Income[];
  onUpdateExpenseClick: (expenseId: string) => void;
  onDeleteExpenseClick: (expenseId: string) => void;
  onUpdateIncomeClick: (incomeId: string) => void;
  onDeleteIncomeClick: (incomeId: string) => void;
}

export default function TransactionList({
  pocket,
  expenses,
  income,
  onUpdateExpenseClick,
  onDeleteExpenseClick,
  onUpdateIncomeClick,
  onDeleteIncomeClick,
}: TransactionListProps) {
  const [showBalanceHistory, setShowBalanceHistory] = useState(false);

  const pocketExpenses = expenses.filter((e) => e.pocketId === pocket.id);
  const pocketIncome = income.filter((i) => i.pocketId === pocket.id);

  const handleUpdateClick = (id: string, type: "expense" | "income") => {
    if (type === "expense") {
      onUpdateExpenseClick(id);
    } else {
      onUpdateIncomeClick(id);
    }
  };

  const handleDeleteClick = (id: string, type: "expense" | "income") => {
    if (type === "expense") {
      onDeleteExpenseClick(id);
    } else {
      onDeleteIncomeClick(id);
    }
  };

  // Combine and sort expenses and income by date
  const allTransactions = [
    ...pocketExpenses.map((e) => ({
      ...e,
      type: "expense" as const,
    })),
    ...pocketIncome.map((i) => ({ ...i, type: "income" as const })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  if (pocketExpenses.length === 0 && pocketIncome.length === 0) {
    return (
      <EmptyState
        icon={FileTextIcon}
        iconColor="zinc"
        title="No transactions yet"
        description="Start tracking expenses and income for this pocket!"
      />
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Transactions{" "}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({allTransactions.length})
            </span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBalanceHistory(!showBalanceHistory)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              showBalanceHistory
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            <BarChart3Icon size={16} />
            Balance History
          </motion.button>
        </div>
      </div>

      {showBalanceHistory && (
        <BalanceHistoryChart
          pocket={pocket}
          expenses={pocketExpenses}
          income={pocketIncome}
        />
      )}

      <div className="space-y-3">
        {allTransactions.map((transaction, index) => (
          <TransactionItem
            key={`${transaction.type}-${transaction.id}`}
            transaction={transaction}
            index={index}
            onUpdateClick={(id) => handleUpdateClick(id, transaction.type)}
            onDeleteClick={(id) => handleDeleteClick(id, transaction.type)}
          />
        ))}
      </div>
    </>
  );
}