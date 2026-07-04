"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TrendingDownIcon, TargetIcon, BrainIcon } from "../icons";

const navItems = [
  { href: "/", label: "Pockets", icon: HomeIcon },
  { href: "/expenses", label: "Expenses", icon: TrendingDownIcon },
  { href: "/needs", label: "Budget", icon: TargetIcon },
  { href: "/insights", label: "Insights", icon: BrainIcon },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-zinc-200/50 bg-white px-4 py-6 dark:border-zinc-800/50 dark:bg-zinc-900 lg:flex">
      <p className="mb-8 px-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Pocketly
      </p>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
