"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Mascot from "./Mascot";

interface LoadingModalProps {
  isOpen: boolean;
}

const MESSAGES = [
  "Counting your coins...",
  "Balancing the books...",
  "Checking the pockets...",
  "Crunching the numbers...",
  "Almost there...",
];

export default function LoadingModal({ isOpen }: LoadingModalProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setMsgIndex(0);
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % MESSAGES.length),
      2000
    );
    return () => clearInterval(id);
  }, [isOpen]);

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
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/95 backdrop-blur-xl px-10 py-8 shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900/95">
              <div className="flex flex-col items-center justify-center gap-3">
                <Mascot mood="counting" size={120} />
                <div className="h-5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={msgIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      {MESSAGES[msgIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                      style={{
                        animation: `mascot-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
