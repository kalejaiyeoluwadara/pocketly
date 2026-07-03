"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { TrendingUpIcon, TrendingDownIcon } from "../icons";
import { formatCurrency } from "../utils/currency";
import moment from "moment";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  type: "expense" | "income";
}

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  onUpdateClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export default function TransactionItem({
  transaction,
  index,
  onUpdateClick,
  onDeleteClick
}: TransactionItemProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const transactionId = `${transaction.type}-${transaction.id}`;

  const handleUpdateClick = () => {
    setIsDropdownOpen(false);
    onUpdateClick(transaction.id);
  };

  const handleDeleteClick = () => {
    setIsDropdownOpen(false);
    onDeleteClick(transaction.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        transaction.type === "income"
          ? "border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-900/20"
          : "border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-2 flex-1">
        {transaction.type === "income" ? (
          <div className="rounded-md bg-emerald-500 p-[4px]">
            <TrendingUpIcon size={13} className="text-white" />
          </div>
        ) : (
          <div className="rounded-md bg-red-600 p-[4px]">
            <TrendingDownIcon size={13} className="text-white" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
            {transaction.description}
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            {moment(transaction.createdAt).format("MMM D, YYYY")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium ${
            transaction.type === "income"
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {formatCurrency(transaction.amount, true)}
        </span>
        <div className="relative" data-transaction-dropdown>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              setIsDropdownOpen(!isDropdownOpen)
            }
            className="rounded-lg p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <MoreHorizontalIcon
              size={16}
              className="text-zinc-500 dark:text-zinc-400"
            />
          </motion.button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-zinc-200/50 bg-white shadow-lg dark:border-zinc-800/50 dark:bg-zinc-900"
              >
                <div className="py-1">
                  <button
                    onClick={handleUpdateClick}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <PencilIcon size={16} />
                    Update
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}