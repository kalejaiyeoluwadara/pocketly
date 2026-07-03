"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ResponsiveModal from "../../components/ResponsiveModal";

export default function ModalPreviewPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <button onClick={() => setIsOpen(true)}>Open</button>
      <AnimatePresence>
        {isOpen && (
          <ResponsiveModal onClose={() => setIsOpen(false)}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-red-600 p-2 dark:bg-red-500">
                <div className="h-5 w-5 bg-white" />
              </div>
              <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50">
                New Expense
              </h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Amount
                </label>
                <input
                  className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <input
                  className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="What did you spend on?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button className="flex-1 rounded-xl border-2 border-zinc-200 bg-white py-3 font-medium text-zinc-700">
                  Cancel
                </motion.button>
                <motion.button className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white">
                  Add
                </motion.button>
              </div>
            </div>
          </ResponsiveModal>
        )}
      </AnimatePresence>
    </div>
  );
}
