"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingDown, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getPocketPace } from "../utils/pace";
import { formatCurrency } from "../utils/currency";

function sumBetween(
  expenses: { amount: number; createdAt: string }[],
  from: Date,
  to: Date
): number {
  return expenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return d >= from && d < to;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * The 10-second daily glance: today so far, yesterday, streak, and the one
 * pocket that most needs attention. Celebrates good days instead of only
 * flagging bad ones.
 */
export default function DailyCheckIn() {
  const { pockets, expenses, isLoading } = useApp();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/streak")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStreak(data?.currentStreak ?? null))
      .catch(() => setStreak(null));
  }, []);

  if (isLoading || pockets.length === 0) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const spentToday = sumBetween(expenses, todayStart, now);
  const spentYesterday = sumBetween(expenses, yesterdayStart, todayStart);

  // The pocket most worth flagging: over budget first, then tightest pace
  const paces = pockets
    .map((p) => ({ pocket: p, pace: getPocketPace(p, expenses, now) }))
    .filter((x) => x.pace !== null);
  const flagged =
    paces.find((x) => x.pace!.status === "over") ??
    paces.find((x) => x.pace!.status === "tight");
  const allOnTrack = paces.length > 0 && !flagged;

  const quieterDay = spentYesterday > 0 && spentToday < spentYesterday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-2xl border border-zinc-200/50 bg-white p-4 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Today&apos;s check-in
        </h2>
        {streak !== null && streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <Flame size={13} className="fill-current" />
            {streak}-day streak
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Spent today
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(spentToday, true)}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Yesterday
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-zinc-500 dark:text-zinc-400">
            {formatCurrency(spentYesterday, true)}
          </p>
        </div>
      </div>

      {(flagged || allOnTrack || quieterDay) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          {flagged ? (
            <>
              <TrendingUp
                size={14}
                className={
                  flagged.pace!.status === "over"
                    ? "text-red-500"
                    : "text-amber-500"
                }
              />
              <span
                className={
                  flagged.pace!.status === "over"
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {flagged.pocket.name}: {flagged.pace!.summary}
              </span>
            </>
          ) : (
            <>
              <TrendingDown size={14} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                {allOnTrack
                  ? "All budgets on track — nice pacing! 🎉"
                  : "Quieter than yesterday — keep it up!"}
              </span>
            </>
          )}
        </p>
      )}
    </motion.div>
  );
}
