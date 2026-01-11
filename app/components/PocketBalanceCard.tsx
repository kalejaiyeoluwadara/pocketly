"use client";

import ExpenseForm from "./ExpenseForm";
import IncomeForm from "./IncomeForm";
import { formatCurrency } from "../utils/currency";

interface Pocket {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

interface PocketBalanceCardProps {
  pocket: Pocket;
  totalIncome: number;
  totalSpent: number;
}

export default function PocketBalanceCard({ pocket, totalIncome, totalSpent }: PocketBalanceCardProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-1 border border-zinc-200/50 bg-white p-5 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900 rounded-2xl">
        <div className="col-span-2 ">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Current Balance
          </p>
          <p
            className={`text-lg font-medium ${
              pocket.balance < 0
                ? "text-red-500"
                : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            {formatCurrency(pocket.balance)}
          </p>
          <section className="mt-2 flex gap-2">
            <div className="flex-1">
              <ExpenseForm defaultPocketId={pocket.id} />
            </div>
            <div className="flex-1">
              <IncomeForm defaultPocketId={pocket.id} />
            </div>
          </section>
        </div>

        <div className=" ">
          <p className="mb-2 text-xs text-right font-medium text-zinc-500 dark:text-zinc-400">
            Total Income
          </p>
          <p className="text-xs font-medium text-emerald-500 text-right">
            {formatCurrency(totalIncome, "6px")}
          </p>
          <p className="mb-2 mt-4 text-xs text-right font-medium text-zinc-500 dark:text-zinc-400">
            Total Spent
          </p>
          <p className="text-xs font-medium text-red-500 text-right">
            {formatCurrency(totalSpent, "6px")}
          </p>
        </div>
      </div>
    </div>
  );
}