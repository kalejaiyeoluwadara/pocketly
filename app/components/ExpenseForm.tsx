"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, Loader2Icon } from "../icons";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/currency";
import { toast } from "sonner";
import ResponsiveModal from "./ResponsiveModal";
import AmountPad, { evaluateAmount } from "./AmountPad";
import DescriptionChips, { EXPENSE_PRESETS } from "./DescriptionChips";

export interface ExpenseFormRef {
  open: () => void;
}

interface ExpenseFormProps {
  defaultPocketId?: string;
}

const ExpenseForm = forwardRef<ExpenseFormRef, ExpenseFormProps>(
  ({ defaultPocketId }, ref) => {
  const { pockets, expenses, addExpense } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [pocketId, setPocketId] = useState(defaultPocketId || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (defaultPocketId) {
      setPocketId(defaultPocketId);
    } else if (pockets.length === 1) {
      setPocketId(pockets[0].id);
    }
  }, [defaultPocketId, pockets]);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const activePocketId =
    pocketId || (pockets.length === 1 ? pockets[0].id : "");
  const selectedPocket = pockets.find((p) => p.id === activePocketId);

  // Most frequent recent amounts for this pocket, falling back to presets
  const recent = expenses
    .filter((e) => !activePocketId || e.pocketId === activePocketId)
    .slice(0, 30)
    .map((e) => e.amount);
  const counts = new Map<number, number>();
  recent.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
  const suggestions = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([n]) => n);
  if (suggestions.length === 0) suggestions.push(500, 1000, 2000, 5000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPocketId =
      pocketId || (pockets.length === 1 ? pockets[0].id : "");
    const total = evaluateAmount(amount);
    if (!finalPocketId || total <= 0 || !description) return;

    setIsLoading(true);
    try {
      await addExpense(finalPocketId, total, description);
      toast.success("Expense added successfully!");
      setPocketId(defaultPocketId || (pockets.length === 1 ? pockets[0].id : ""));
      setAmount("");
      setDescription("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add expense"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (pockets.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Create a pocket first to record expenses
      </div>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="group relative py-2 px-1 flex w-full items-center justify-center gap-1 rounded-full bg-white"
      >
        <PlusIcon
          size={10}
          className="transition-transform text-black duration-300 group-hover:rotate-90"
        />
        <p className="text-[10px] font-medium text-black ">Add Expense</p>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ResponsiveModal onClose={() => setIsOpen(false)}>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-red-600 p-2 dark:bg-red-500">
                  <PlusIcon size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  New Expense
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {pockets.length > 1 && !defaultPocketId && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Pocket
                    </label>
                    <select
                      value={pocketId}
                      onChange={(e) => setPocketId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      required
                    >
                      <option value="">Select a pocket</option>
                      {pockets.map((pocket) => (
                        <option key={pocket.id} value={pocket.id}>
                          {pocket.name} ({formatCurrency(pocket.balance)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {defaultPocketId && (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
                    Pocket:{" "}
                    {pockets.find((p) => p.id === defaultPocketId)?.name}
                  </div>
                )}
                <AmountPad
                  value={amount}
                  onChange={setAmount}
                  suggestions={suggestions}
                  max={selectedPocket?.balance}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you spend on?"
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-red-400"
                    required
                  />
                  <DescriptionChips
                    history={expenses
                      .filter((e) => !activePocketId || e.pocketId === activePocketId)
                      .map((e) => e.description)}
                    presets={EXPENSE_PRESETS}
                    selected={description}
                    onPick={setDescription}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-xl border-2 border-zinc-200 bg-white py-3 font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2Icon size={18} className="animate-spin" />
                        Adding...
                      </span>
                    ) : evaluateAmount(amount) > 0 ? (
                      `Spend ₦${evaluateAmount(amount).toLocaleString()}`
                    ) : (
                      "Add"
                    )}
                  </motion.button>
                </div>
              </form>
          </ResponsiveModal>
        )}
      </AnimatePresence>
    </>
  );
});

ExpenseForm.displayName = "ExpenseForm";

export default ExpenseForm;
