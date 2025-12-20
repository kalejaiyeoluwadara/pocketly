"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, Loader2Icon } from "../icons";
import { useApp } from "../context/AppContext";
import { Priority } from "../types";
import { toast } from "sonner";

export interface NeedFormRef {
  open: () => void;
}

const NeedForm = forwardRef<NeedFormRef>((props, ref) => {
  const { addNeed } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isLoading, setIsLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsLoading(true);
    try {
      await addNeed(title, parseFloat(amount), priority);
      toast.success("Need added successfully!");
      setTitle("");
      setAmount("");
      setPriority("medium");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add need"
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
        className="group relative py-2 px-2 flex w-full items-center justify-center gap-1 rounded-full bg-white"
      >
        <PlusIcon
          size={10}
          className="transition-transform text-black duration-300 group-hover:rotate-90"
        />
        <p className="text-xs font-medium text-black ">Add Need</p>
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
                <div className="rounded-xl bg-amber-600 p-2 dark:bg-amber-500">
                  <PlusIcon size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                  New Need
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you need?"
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-amber-400"
                    required
                  />
                </div>
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
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    required
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
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
                    className="flex-1 rounded-xl bg-amber-600 py-3 font-medium text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-500 dark:hover:bg-amber-600"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2Icon size={18} className="animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      "Add"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

NeedForm.displayName = "NeedForm";

export default NeedForm;
