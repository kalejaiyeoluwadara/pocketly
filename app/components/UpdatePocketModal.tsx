"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pocket } from "../types";
import { Pencil } from "lucide-react";
import ResponsiveModal from "./ResponsiveModal";

interface UpdatePocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocket: Pocket;
  onUpdate: (id: string, name: string, balance?: number, monthlyBudget?: number) => Promise<void>;
}

export default function UpdatePocketModal({
  isOpen,
  onClose,
  pocket,
  onUpdate,
}: UpdatePocketModalProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  useEffect(() => {
    if (isOpen && pocket) {
      setName(pocket.name);
      setBalance(pocket.balance.toString());
      setMonthlyBudget(
        pocket.monthlyBudget ? pocket.monthlyBudget.toString() : ""
      );
    }
  }, [isOpen, pocket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await onUpdate(
        pocket.id,
        name,
        parseFloat(balance),
        monthlyBudget ? parseFloat(monthlyBudget) : 0
      );
      onClose();
      setName("");
      setBalance("");
      setMonthlyBudget("");
    } catch (error) {
      console.error("Failed to update pocket:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ResponsiveModal onClose={onClose}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-600 p-2 dark:bg-indigo-500">
                <Pencil size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                Update Pocket
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Account, Savings"
                  className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Monthly Budget{" "}
                  <span className="font-normal text-zinc-400 dark:text-zinc-500">
                    (optional)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0 = no budget"
                  className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 rounded-xl border-2 border-zinc-200 bg-white py-3 font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Update Pocket
                </motion.button>
              </div>
            </form>
        </ResponsiveModal>
      )}
    </AnimatePresence>
  );
}





