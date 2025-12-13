"use client";

import { useApp } from "../context/AppContext";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BottomNav from "../components/BottomNav";
import { formatCurrency } from "../utils/currency";
import Nav from "../components/Nav";

export default function ExpensesPage() {
  const { expenses } = useApp();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen fixed bg-zinc-50 pb-20 dark:bg-black">
      <Nav />
      <div className="mx-auto max-w-md px-4 pt-3 pb-6">
        <div className="mb-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Spent
            </p>
            <p className="text-2xl font-medium text-red-500">
              {formatCurrency(totalExpenses)}
            </p>
            <div className="mt-4  flex items-start justify-start">
              <ExpenseForm />
            </div>
          </div>
        </div>

        <ExpenseList />
      </div>
      <BottomNav />
    </div>
  );
}

