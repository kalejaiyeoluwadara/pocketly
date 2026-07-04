import { Pocket, Expense } from "../types";

export type PaceStatus = "on-track" | "tight" | "over";

export interface PocketPace {
  /** Total spent from this pocket this calendar month */
  spentThisMonth: number;
  budget: number;
  /** Budget minus spent; negative when over */
  remaining: number;
  /** 0..1+, spent as a fraction of budget */
  usedRatio: number;
  daysLeftInMonth: number;
  status: PaceStatus;
  /** Short human line, e.g. "₦12,400 left · 9 days to go" */
  summary: string;
}

function formatNaira(amount: number): string {
  return `₦${Math.abs(amount).toLocaleString("en-NG", {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Compares a pocket's month-to-date spending against its monthly budget.
 * Returns null when the pocket has no budget set.
 *
 * "tight" means spending is running ahead of the calendar — more of the
 * budget is used than the month has elapsed, with a small grace margin.
 */
export function getPocketPace(
  pocket: Pocket,
  expenses: Expense[],
  now: Date = new Date()
): PocketPace | null {
  const budget = pocket.monthlyBudget || 0;
  if (budget <= 0) return null;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const spentThisMonth = expenses
    .filter(
      (e) => e.pocketId === pocket.id && new Date(e.createdAt) >= monthStart
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const daysLeftInMonth = daysInMonth - now.getDate();
  const monthElapsedRatio = now.getDate() / daysInMonth;

  const remaining = budget - spentThisMonth;
  const usedRatio = spentThisMonth / budget;

  let status: PaceStatus = "on-track";
  if (remaining < 0) {
    status = "over";
  } else if (usedRatio > monthElapsedRatio + 0.1) {
    status = "tight";
  }

  const summary =
    status === "over"
      ? `${formatNaira(remaining)} over budget · ${daysLeftInMonth} day${
          daysLeftInMonth === 1 ? "" : "s"
        } left`
      : `${formatNaira(remaining)} left · ${daysLeftInMonth} day${
          daysLeftInMonth === 1 ? "" : "s"
        } to go`;

  return {
    spentThisMonth,
    budget,
    remaining,
    usedRatio,
    daysLeftInMonth,
    status,
    summary,
  };
}
