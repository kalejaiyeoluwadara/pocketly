"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import ResponsiveModal from "./ResponsiveModal";
import { parseExpenseInput } from "../utils/parseExpense";
import { CATEGORY_EMOJI, isExpenseCategory } from "../utils/categories";
import { formatCurrency } from "../utils/currency";

/**
 * The fastest path from "I just spent money" to "it's logged":
 * a floating button opening a single text input that understands
 * lines like "2500 suya and drinks" or "bolt to island 4.5k".
 */
export default function QuickAdd() {
  const { pockets, expenses, addExpense } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pocketId, setPocketId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default to the pocket the user last spent from
  useEffect(() => {
    if (pocketId) return;
    if (pockets.length === 1) {
      setPocketId(pockets[0].id);
    } else if (expenses.length > 0) {
      const lastUsed = expenses[0].pocketId;
      if (pockets.some((p) => p.id === lastUsed)) setPocketId(lastUsed);
    }
  }, [pockets, expenses, pocketId]);

  useEffect(() => {
    if (isOpen) {
      // Wait for the modal animation before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Support the PWA "Quick Add" shortcut (/?quickadd=1)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("quickadd")) {
      setIsOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const preview = parseExpenseInput(input);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pocketId || !input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let parsed = parseExpenseInput(input);

      // Regex couldn't find an amount — let Gemini try
      if (!parsed) {
        const res = await fetch("/api/ai/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });
        if (res.ok) {
          const data = await res.json();
          parsed = {
            amount: data.amount,
            description: data.description,
            category: isExpenseCategory(data.category)
              ? data.category
              : "Other",
          };
        }
      }

      if (!parsed) {
        toast.error('Add an amount, e.g. "2500 suya and drinks"');
        return;
      }

      await addExpense(
        pocketId,
        parsed.amount,
        parsed.description,
        parsed.category
      );
      toast.success(
        `Logged ₦${parsed.amount.toLocaleString()} · ${parsed.description}`
      );
      setInput("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add expense"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (pockets.length === 0) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        aria-label="Quick add expense"
        className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-zinc-900 text-white shadow-elevated-lg dark:bg-zinc-100 dark:text-zinc-900 lg:bottom-8 lg:right-8"
      >
        <Zap size={22} className="fill-current" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ResponsiveModal onClose={() => setIsOpen(false)}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-zinc-900 p-2 dark:bg-zinc-100">
                <Zap size={20} className="fill-current text-white dark:text-zinc-900" />
              </div>
              <div>
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  Quick Add
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Amount + what it was, in one line
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='e.g. "2500 suya and drinks"'
                enterKeyHint="done"
                className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-lg text-zinc-900 placeholder:text-base placeholder:text-zinc-400 transition-all duration-200 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100"
              />

              {/* Live parse preview */}
              <AnimatePresence mode="wait">
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {preview.description}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {CATEGORY_EMOJI[preview.category]} {preview.category}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(preview.amount, true)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {pockets.length > 1 && (
                <select
                  value={pocketId}
                  onChange={(e) => setPocketId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  required
                >
                  <option value="">Select a pocket</option>
                  {pockets.map((pocket) => (
                    <option key={pocket.id} value={pocket.id}>
                      {pocket.name}
                    </option>
                  ))}
                </select>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || !input.trim() || !pocketId}
                whileHover={!isLoading ? { scale: 1.01 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full rounded-xl bg-zinc-900 py-3.5 font-medium text-white transition-all duration-200 hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Logging...
                  </span>
                ) : preview ? (
                  `Log ₦${preview.amount.toLocaleString()}`
                ) : (
                  "Log expense"
                )}
              </motion.button>
            </form>
          </ResponsiveModal>
        )}
      </AnimatePresence>
    </>
  );
}
