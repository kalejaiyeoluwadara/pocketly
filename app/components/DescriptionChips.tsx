"use client";

import { motion } from "framer-motion";

interface DescriptionChipsProps {
  history?: string[]; // recent descriptions, newest first
  presets: string[];
  onPick: (description: string) => void;
  selected?: string;
}

/**
 * One-tap description suggestions: the user's most frequent recent
 * descriptions first, topped up with popular presets.
 */
export default function DescriptionChips({
  history = [],
  presets,
  onPick,
  selected,
}: DescriptionChipsProps) {
  const counts = new Map<string, number>();
  history.slice(0, 30).forEach((d) => {
    const key = d.trim();
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  const frequent = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);

  const seen = new Set<string>();
  const chips = [...frequent, ...presets]
    .filter((d) => {
      const key = d.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chips.map((d) => {
        const active = selected?.trim().toLowerCase() === d.toLowerCase();
        return (
          <motion.button
            key={d}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onPick(d)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {d}
          </motion.button>
        );
      })}
    </div>
  );
}

export const EXPENSE_PRESETS = [
  "Food",
  "Transport",
  "Airtime",
  "Data",
  "Groceries",
  "Fuel",
];

export const INCOME_PRESETS = [
  "Salary",
  "Freelance",
  "Allowance",
  "Gift",
  "Transfer",
  "Refund",
];
