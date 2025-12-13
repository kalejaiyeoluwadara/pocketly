"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "../icons";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/currency";

interface IncomeFormProps {
  defaultPocketId?: string;
}

export default function IncomeForm({ defaultPocketId }: IncomeFormProps) {
  const { pockets, addIncome } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [pocketId, setPocketId] = useState(defaultPocketId || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (defaultPocketId) {
      setPocketId(defaultPocketId);
    } else if (pockets.length === 1) {
      setPocketId(pockets[0].id);
    }
  }, [defaultPocketId, pockets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPocketId =
      pocketId || (pockets.length === 1 ? pockets[0].id : "");
    if (!finalPocketId || !amount || !description) return;

    addIncome(finalPocketId, parseFloat(amount), description);
    setPocketId(defaultPocketId || (pockets.length === 1 ? pockets[0].id : ""));
    setAmount("");
    setDescription("");
    setIsOpen(false);
  };

  if (pockets.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Create a pocket first to record income
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
        <p className="text-[10px] font-medium text-black ">Add Income</p>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl border-t border-zinc-200/50 bg-white/95 backdrop-blur-xl p-6 pb-20 shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900/95"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-600 p-2 dark:bg-emerald-500">
                  <PlusIcon size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  New Income
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Where did the money come from?"
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-xl border-2 border-zinc-200 bg-white py-3 font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-xl bg-emerald-600 py-3 font-medium text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    Add
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

