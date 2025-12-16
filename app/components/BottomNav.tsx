"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HomeIcon, TrendingDownIcon, TargetIcon, BrainIcon } from "../icons";

const navItems = [
  { href: "/", label: "Pockets", icon: HomeIcon },
  { href: "/expenses", label: "Expenses", icon: TrendingDownIcon },
  { href: "/needs", label: "Needs", icon: TargetIcon },
  { href: "/insights", label: "Insights", icon: BrainIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/50 bg-white/90 backdrop-blur-xl shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900/90">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-2 transition-colors"
            >
              <Icon
                size={20}
                className={`transition-colors ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 dark:text-zinc-600"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 dark:text-zinc-600"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 h-1 w-12 rounded-full bg-zinc-900 dark:bg-zinc-50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

