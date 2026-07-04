"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  PocketsNavIcon,
  ExpensesNavIcon,
  NeedsNavIcon,
  InsightsNavIcon,
} from "../icons";

const navItems = [
  { href: "/", label: "Pockets", icon: PocketsNavIcon },
  { href: "/expenses", label: "Expenses", icon: ExpensesNavIcon },
  { href: "/needs", label: "Budget", icon: NeedsNavIcon },
  { href: "/insights", label: "Insights", icon: InsightsNavIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-1/2 z-50 -translate-x-1/2 lg:hidden"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-1 rounded-full border border-zinc-200/60 bg-white/85 p-1.5 shadow-elevated-lg backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/85">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              onClick={() => navigator.vibrate?.(8)}
              className="relative flex h-11 items-center justify-center rounded-full px-3.5"
            >
              {isActive && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-zinc-900 shadow-sm dark:bg-zinc-100"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon
                  size={19}
                  active={isActive}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-white dark:text-zinc-900"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="text-xs font-semibold text-white dark:text-zinc-900"
                  >
                    {item.label}
                  </motion.span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
