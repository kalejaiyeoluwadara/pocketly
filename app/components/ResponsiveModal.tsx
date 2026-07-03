"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResponsiveModalProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Bottom sheet on mobile, centered dialog on desktop (md+).
 * Must be rendered inside an <AnimatePresence> by the caller.
 */
export default function ResponsiveModal({
  onClose,
  children,
  className = "",
}: ResponsiveModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none md:items-center md:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`pointer-events-auto max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border-t border-zinc-200/50 bg-white/95 p-6 pb-20 shadow-elevated-lg backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/95 md:max-w-md md:rounded-3xl md:border md:border-zinc-200/50 md:pb-6 md:shadow-2xl dark:md:border-zinc-800/50 ${className}`}
        >
          <div className="mb-4 flex justify-center md:hidden">
            <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
          {children}
        </motion.div>
      </div>
    </>
  );
}
