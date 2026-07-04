"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, Loader2Icon } from "../icons";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import ResponsiveModal from "./ResponsiveModal";
import AmountPad, { evaluateAmount } from "./AmountPad";

// One-tap pocket templates reflecting how Nigerians actually split money
const POCKET_TEMPLATES = [
  { name: "Food", emoji: "🍛" },
  { name: "Transport", emoji: "🚌" },
  { name: "Data & Airtime", emoji: "📱" },
  { name: "Family Support", emoji: "🤝" },
  { name: "Rent", emoji: "🏠" },
  { name: "Ajo / Savings", emoji: "💰" },
  { name: "Church / Mosque", emoji: "🙏" },
  { name: "Flex", emoji: "🎉" },
];

export interface PocketFormRef {
  open: () => void;
}

const PocketForm = forwardRef<PocketFormRef>((props, ref) => {
  const { addPocket } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialBalance) return;

    setIsLoading(true);
    try {
      await addPocket(
        name,
        evaluateAmount(initialBalance),
        monthlyBudget ? evaluateAmount(monthlyBudget) : undefined
      );
      toast.success("Pocket created successfully!");
      setName("");
      setInitialBalance("");
      setMonthlyBudget("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create pocket"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="group relative py-2 px-4 flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100"
      >
        <PlusIcon
          size={14}
          className="transition-transform text-white dark:text-zinc-900 duration-300 group-hover:rotate-90"
        />
        <p className="text-xs font-medium text-white dark:text-zinc-900">Create Pocket</p>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ResponsiveModal onClose={() => setIsOpen(false)}>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-600 p-2 dark:bg-indigo-500">
                  <PlusIcon size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  New Pocket
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    {POCKET_TEMPLATES.map((t) => {
                      const active = name === t.name;
                      return (
                        <motion.button
                          key={t.name}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setName(t.name)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                              : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          <span className="mr-1">{t.emoji}</span>
                          {t.name}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Initial Balance
                  </label>
                  <AmountPad value={initialBalance} onChange={setInitialBalance} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Monthly Budget{" "}
                    <span className="font-normal text-zinc-400 dark:text-zinc-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={monthlyBudget}
                    onChange={(e) =>
                      setMonthlyBudget(e.target.value.replace(/[^\d.+]/g, ""))
                    }
                    placeholder="e.g. 50000 — we'll track your pace against it"
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-sm placeholder:text-zinc-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400"
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
                    className="flex-1 rounded-xl bg-indigo-600 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2Icon size={18} className="animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create"
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

PocketForm.displayName = "PocketForm";

export default PocketForm;
