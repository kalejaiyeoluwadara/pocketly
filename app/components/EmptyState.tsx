"use client";

import { motion } from "framer-motion";
import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

interface EmptyStateProps {
  icon: ComponentType<LucideProps>;
  iconColor?: "red" | "amber" | "zinc" | "blue" | "green";
  title: string;
  description: string;
  onClick?: () => void;
}

const iconColorClasses = {
  red: {
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-500",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/20",
    text: "text-amber-500",
  },
  zinc: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-500",
  },
};

export default function EmptyState({
  icon: Icon,
  iconColor = "zinc",
  title,
  description,
  onClick,
}: EmptyStateProps) {
  const colorClasses = iconColorClasses[iconColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900 ${
        onClick
          ? "cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50 transition-all duration-200"
          : ""
      }`}
    >
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colorClasses.bg}`}
      >
        <Icon className={`h-8 w-8 ${colorClasses.text}`} />
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </motion.div>
  );
}
