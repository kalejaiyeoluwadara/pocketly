"use client";

import { motion } from "framer-motion";
import Mascot from "./Mascot";

interface EmptyStateProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export default function EmptyState({
  title,
  description,
  onClick,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900 ${
        onClick
          ? "cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50 transition-all duration-200"
          : ""
      }`}
    >
      <Mascot mood="sleepy" size={100} className="mx-auto mb-2" />
      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </motion.div>
  );
}
