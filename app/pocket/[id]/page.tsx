"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import ExpenseForm from "../../components/ExpenseForm";
import IncomeForm from "../../components/IncomeForm";
import EmptyState from "../../components/EmptyState";
import UpdatePocketModal from "../../components/UpdatePocketModal";
import UpdateExpenseModal from "../../components/UpdateExpenseModal";
import UpdateIncomeModal from "../../components/UpdateIncomeModal";
import {
  WalletIcon,
  FileTextIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "../../icons";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../../utils/currency";
import moment from "moment";
import {
  ChevronLeftIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

export default function PocketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    pockets,
    expenses,
    income,
    deletePocket,
    updatePocket,
    deleteExpense,
    deleteIncome,
    updateExpense,
    updateIncome,
  } = useApp();
  const pocket = pockets.find((p) => p.id === params.id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [openTransactionDropdown, setOpenTransactionDropdown] = useState<
    string | null
  >(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!pocket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 pb-20 dark:bg-black">
        <div className="mx-auto max-w-md px-4 py-6">
          <p className="text-zinc-500 dark:text-zinc-400">Pocket not found</p>
        </div>
      </div>
    );
  }

  const pocketExpenses = expenses.filter((e) => e.pocketId === pocket.id);
  const pocketIncome = income.filter((i) => i.pocketId === pocket.id);
  const totalSpent = pocketExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = pocketIncome.reduce((sum, i) => sum + i.amount, 0);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close pocket dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }

      // Close transaction dropdowns if clicking outside any transaction dropdown
      if (openTransactionDropdown) {
        // Check if click is on a transaction dropdown button or menu
        const isTransactionDropdown = target.closest(
          "[data-transaction-dropdown]"
        );
        if (!isTransactionDropdown) {
          setOpenTransactionDropdown(null);
        }
      }
    };

    if (isDropdownOpen || openTransactionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, openTransactionDropdown]);

  const handleDelete = () => {
    setIsDropdownOpen(false);
    if (confirm("Are you sure you want to delete this pocket?")) {
      deletePocket(pocket.id);
      router.push("/");
    }
  };

  const handleUpdateClick = () => {
    setIsDropdownOpen(false);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setOpenTransactionDropdown(null);
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(expenseId);
    }
  };

  const handleDeleteIncome = (incomeId: string) => {
    setOpenTransactionDropdown(null);
    if (confirm("Are you sure you want to delete this income?")) {
      deleteIncome(incomeId);
    }
  };

  const handleUpdateExpenseClick = (expenseId: string) => {
    setOpenTransactionDropdown(null);
    setEditingExpense(expenseId);
  };

  const handleUpdateIncomeClick = (incomeId: string) => {
    setOpenTransactionDropdown(null);
    setEditingIncome(incomeId);
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
          <section className="flex items-start justify-between">
            <div className="mb-6 ">
              <div className="flex-1">
                <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
                  {pocket.name}
                </h1>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
                  Created {moment(pocket.createdAt).format("MMM D, YYYY")}
                </p>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-lg p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <MoreHorizontalIcon
                  size={20}
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
                        onClick={handleDelete}
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
          </section>

          <div className="grid grid-cols-3 gap-1 border border-zinc-200/50 bg-white p-5 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900 rounded-2xl">
            <div className="col-span-2 ">
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Current Balance
              </p>
              <p
                className={`text-lg font-medium ${
                  pocket.balance < 0
                    ? "text-red-500"
                    : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {formatCurrency(pocket.balance)}
              </p>
              <section className="mt-2 flex gap-2">
                <div className="flex-1">
                  <ExpenseForm defaultPocketId={pocket.id} />
                </div>
                <div className="flex-1">
                  <IncomeForm defaultPocketId={pocket.id} />
                </div>
              </section>
            </div>

            <div className=" ">
              <p className="mb-2 text-xs text-right font-medium text-zinc-500 dark:text-zinc-400">
                Total Income
              </p>
              <p className="text-xs font-medium text-emerald-500 text-right">
                {formatCurrency(totalIncome, "6px")}
              </p>
              <p className="mb-2 mt-4 text-xs text-right font-medium text-zinc-500 dark:text-zinc-400">
                Total Spent
              </p>
              <p className="text-xs font-medium text-red-500 text-right">
                {formatCurrency(totalSpent, "6px")}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Transactions{" "}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({pocketExpenses.length + pocketIncome.length})
            </span>
          </h2>
        </div>

        {pocketExpenses.length === 0 && pocketIncome.length === 0 ? (
          <EmptyState
            icon={FileTextIcon}
            iconColor="zinc"
            title="No transactions yet"
            description="Start tracking expenses and income for this pocket!"
          />
        ) : (
          <div className="space-y-3">
            {/* Combine and sort expenses and income by date */}
            {[
              ...pocketExpenses.map((e) => ({
                ...e,
                type: "expense" as const,
              })),
              ...pocketIncome.map((i) => ({ ...i, type: "income" as const })),
            ]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((transaction, index) => {
                const transactionId = `${transaction.type}-${transaction.id}`;
                const isDropdownOpen =
                  openTransactionDropdown === transactionId;

                return (
                  <motion.div
                    key={transactionId}
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
                        <p className="text-[8px] text-zinc-500 dark:text-zinc-400">
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
                        {formatCurrency(transaction.amount, "6px")}
                      </span>
                      <div className="relative" data-transaction-dropdown>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setOpenTransactionDropdown(
                              isDropdownOpen ? null : transactionId
                            )
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
                                  onClick={() => {
                                    if (transaction.type === "expense") {
                                      handleUpdateExpenseClick(transaction.id);
                                    } else {
                                      handleUpdateIncomeClick(transaction.id);
                                    }
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                  <PencilIcon size={16} />
                                  Update
                                </button>
                                <button
                                  onClick={() => {
                                    if (transaction.type === "expense") {
                                      handleDeleteExpense(transaction.id);
                                    } else {
                                      handleDeleteIncome(transaction.id);
                                    }
                                  }}
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
              })}
          </div>
        )}

        <UpdatePocketModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          pocket={pocket}
          onUpdate={updatePocket}
        />

        {editingExpense && (
          <UpdateExpenseModal
            isOpen={!!editingExpense}
            onClose={() => setEditingExpense(null)}
            expense={pocketExpenses.find((e) => e.id === editingExpense)!}
            onUpdate={updateExpense}
          />
        )}

        {editingIncome && (
          <UpdateIncomeModal
            isOpen={!!editingIncome}
            onClose={() => setEditingIncome(null)}
            income={pocketIncome.find((i) => i.id === editingIncome)!}
            onUpdate={updateIncome}
          />
        )}
      </div>
    </div>
  );
}
