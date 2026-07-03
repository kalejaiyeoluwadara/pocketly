"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import PocketHeader from "../../components/PocketHeader";
import PocketBalanceCard from "../../components/PocketBalanceCard";
import TransactionList from "../../components/TransactionList";
import UpdatePocketModal from "../../components/UpdatePocketModal";
import UpdateExpenseModal from "../../components/UpdateExpenseModal";
import UpdateIncomeModal from "../../components/UpdateIncomeModal";
import BottomNav from "../../components/BottomNav";
import SideNav from "../../components/SideNav";
import ConfirmDialog from "../../components/ConfirmDialog";

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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  if (!pocket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 pb-20 dark:bg-black lg:pb-6 lg:pl-56">
        <SideNav />
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
    setConfirmDialog({
      isOpen: true,
      title: "Delete Pocket",
      message: `Are you sure you want to delete "${pocket.name}"? All transactions in this pocket will also be removed. This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deletePocket(pocket.id);
          toast.success("Pocket deleted successfully!");
          router.push("/");
        } catch (error) {
          toast.error("Failed to delete pocket. Please try again.");
        }
      },
    });
  };

  const handleUpdatePocketClick = () => {
    setIsUpdateModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const expense = pocketExpenses.find((e) => e.id === expenseId);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Expense",
      message: `Delete "${expense?.description || "this expense"}"? This will add ₦${expense?.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} back to your pocket balance.`,
      onConfirm: async () => {
        try {
          await deleteExpense(expenseId);
          toast.success("Expense deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete expense. Please try again.");
        }
      },
    });
  };

  const handleDeleteIncome = (incomeId: string) => {
    const inc = pocketIncome.find((i) => i.id === incomeId);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Income",
      message: `Delete "${inc?.description || "this income"}"? This will subtract ₦${inc?.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} from your pocket balance.`,
      onConfirm: async () => {
        try {
          await deleteIncome(incomeId);
          toast.success("Income deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete income. Please try again.");
        }
      },
    });
  };

  const handleUpdateExpenseClick = (expenseId: string) => {
    setEditingExpense(expenseId);
  };

  const handleUpdateIncomeClick = (incomeId: string) => {
    setEditingIncome(incomeId);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black lg:pb-6 lg:pl-56">
      <SideNav />
      <div className="mx-auto max-w-md px-4 py-6 lg:max-w-4xl animate-page-enter">
        <div className="lg:grid lg:grid-cols-5 lg:gap-6">
          <div className="lg:col-span-2">
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
          </div>

          <div className="lg:col-span-3">
            <TransactionList
              pocket={pocket}
              expenses={expenses}
              income={income}
              onUpdateExpenseClick={handleUpdateExpenseClick}
              onDeleteExpenseClick={handleDeleteExpense}
              onUpdateIncomeClick={handleUpdateIncomeClick}
              onDeleteIncomeClick={handleDeleteIncome}
            />
          </div>
        </div>

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

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
        />
      </div>
      <BottomNav />
    </div>
  );
}
