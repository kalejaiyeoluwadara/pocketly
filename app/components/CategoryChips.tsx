"use client";

import { motion } from "framer-motion";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_EMOJI,
  ExpenseCategory,
} from "../utils/categories";

interface CategoryChipsProps {
  selected: string;
  onPick: (category: ExpenseCategory) => void;
  /** Category auto-suggested from the description — shown first with a hint */
  suggested?: ExpenseCategory;
}

/**
 * Horizontal-scroll category picker. The suggested category (from the
 * description keywords) leads the row so the common case is zero extra taps.
 */
export default function CategoryChips({
  selected,
  onPick,
  suggested,
}: CategoryChipsProps) {
  const ordered = suggested
    ? [suggested, ...EXPENSE_CATEGORIES.filter((c) => c !== suggested)]
    : [...EXPENSE_CATEGORIES];

  return (
    <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ordered.map((category) => {
        const active = selected === category;
        return (
          <motion.button
            key={category}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onPick(category)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <span className="mr-1">{CATEGORY_EMOJI[category]}</span>
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
