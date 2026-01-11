"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import PocketHeader from "../../components/PocketHeader";
import PocketBalanceCard from "../../components/PocketBalanceCard";
import TransactionList from "../../components/TransactionList";
import UpdatePocketModal from "../../components/UpdatePocketModal";
import UpdateExpenseModal from "../../components/UpdateExpenseModal";
import UpdateIncomeModal from "../../components/UpdateIncomeModal";

export default function PocketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    pockets,
    expenses,
    income,
    deletePocket,
    updatePocket,
    deleteExpense,
    deleteIncome,
    updateExpense,
    updateIncome,
  } = useApp();
  const pocket = pockets.find((p) => p.id === params.id);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);

  if (!pocket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 pb-20 dark:bg-black">
        <div className="mx-auto max-w-md px-4 py-6">
          <p className="text-zinc-500 dark:text-zinc-400">Pocket not found</p>
        </div>
      </div>
    );
  }

  const pocketExpenses = expenses.filter((e) => e.pocketId === pocket.id);
  const pocketIncome = income.filter((i) => i.pocketId === pocket.id);
  const totalSpent = pocketExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = pocketIncome.reduce((sum, i) => sum + i.amount, 0);

  const handleDeletePocket = () => {
    if (confirm("Are you sure you want to delete this pocket?")) {
      deletePocket(pocket.id);
      router.push("/");
    }
  };

  const handleUpdatePocketClick = () => {
    setIsUpdateModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(expenseId);
    }
  };

  const handleDeleteIncome = (incomeId: string) => {
    if (confirm("Are you sure you want to delete this income?")) {
      deleteIncome(incomeId);
    }
  };

  const handleUpdateExpenseClick = (expenseId: string) => {
    setEditingExpense(expenseId);
  };

  const handleUpdateIncomeClick = (incomeId: string) => {
    setEditingIncome(incomeId);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <div className="mx-auto max-w-md px-4 py-6">
        <PocketHeader
          pocket={pocket}
          onUpdateClick={handleUpdatePocketClick}
          onDelete={handleDeletePocket}
        />

        <PocketBalanceCard
          pocket={pocket}
          totalIncome={totalIncome}
          totalSpent={totalSpent}
        />

        <TransactionList
          pocket={pocket}
          expenses={expenses}
          income={income}
          onUpdateExpenseClick={handleUpdateExpenseClick}
          onDeleteExpenseClick={handleDeleteExpense}
          onUpdateIncomeClick={handleUpdateIncomeClick}
          onDeleteIncomeClick={handleDeleteIncome}
        />

        <UpdatePocketModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          pocket={pocket}
          onUpdate={updatePocket}
        />

        {editingExpense && (
          <UpdateExpenseModal
            isOpen={!!editingExpense}
            onClose={() => setEditingExpense(null)}
            expense={pocketExpenses.find((e) => e.id === editingExpense)!}
            onUpdate={updateExpense}
          />
        )}

        {editingIncome && (
          <UpdateIncomeModal
            isOpen={!!editingIncome}
            onClose={() => setEditingIncome(null)}
            income={pocketIncome.find((i) => i.id === editingIncome)!}
            onUpdate={updateIncome}
          />
        )}
      </div>
    </div>
  );
}
