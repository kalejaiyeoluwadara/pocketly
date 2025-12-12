"use client";

import { useApp } from "../context/AppContext";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BottomNav from "../components/BottomNav";

export default function ExpensesPage() {
  const { expenses } = useApp();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Expenses
          </h1>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Spent</p>
            <p className="text-3xl font-bold text-red-500">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <ExpenseForm />
        </div>

        <ExpenseList />
      </div>
      <BottomNav />
    </div>
  );
}

