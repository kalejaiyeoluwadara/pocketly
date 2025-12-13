"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2Icon } from "../icons";
import { InfinitySpin } from "react-loader-spinner";

interface LoadingModalProps {
  isOpen: boolean;
}

export default function LoadingModal({ isOpen }: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/95 backdrop-blur-xl p-8 shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900/95">
              <div className="flex flex-col items-center justify-center gap-4">
                <InfinitySpin color="white" width="100" height="100" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

