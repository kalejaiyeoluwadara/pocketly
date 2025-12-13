"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Pocket, Expense, Income, Need } from "../types";

interface AppContextType {
  pockets: Pocket[];
  expenses: Expense[];
  income: Income[];
  needs: Need[];
  isLoading: boolean;
  error: string | null;
  addPocket: (name: string, initialBalance: number) => Promise<void>;
  updatePocket: (id: string, name: string, balance?: number) => Promise<void>;
  addExpense: (pocketId: string, amount: number, description: string) => Promise<void>;
  updateExpense: (id: string, pocketId: string, amount: number, description: string) => Promise<void>;
  addIncome: (pocketId: string, amount: number, description: string) => Promise<void>;
  updateIncome: (id: string, pocketId: string, amount: number, description: string) => Promise<void>;
  addNeed: (title: string, amount: number, priority: "high" | "medium" | "low") => Promise<void>;
  updateNeed: (id: string, title: string, amount: number, priority: "high" | "medium" | "low") => Promise<void>;
  deletePocket: (id: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  deleteNeed: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [pocketsRes, expensesRes, incomeRes, needsRes] = await Promise.all([
        fetch("/api/pockets"),
        fetch("/api/expenses"),
        fetch("/api/income"),
        fetch("/api/needs"),
      ]);

      if (!pocketsRes.ok || !expensesRes.ok || !incomeRes.ok || !needsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [pocketsData, expensesData, incomeData, needsData] = await Promise.all([
        pocketsRes.json(),
        expensesRes.json(),
        incomeRes.json(),
        needsRes.json(),
      ]);

      setPockets(pocketsData);
      setExpenses(expensesData);
      setIncome(incomeData);
      setNeeds(needsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPocket = async (name: string, initialBalance: number) => {
    try {
      setError(null);
      const response = await fetch("/api/pockets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, balance: initialBalance }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create pocket");
      }

      const newPocket = await response.json();
      setPockets([newPocket, ...pockets]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create pocket";
      setError(errorMessage);
      throw err;
    }
  };

  const updatePocket = async (id: string, name: string, balance?: number) => {
    try {
      setError(null);
      const body: any = { name };
      if (balance !== undefined) {
        body.balance = balance;
      }

      const response = await fetch(`/api/pockets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update pocket");
      }

      const updatedPocket = await response.json();
      setPockets(pockets.map((p) => (p.id === id ? updatedPocket : p)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update pocket";
      setError(errorMessage);
      throw err;
    }
  };

  const addExpense = async (pocketId: string, amount: number, description: string) => {
    try {
      setError(null);
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pocketId, amount, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create expense");
      }

      const newExpense = await response.json();
      setExpenses([newExpense, ...expenses]);

      // Refresh pockets to get updated balance
      const pocketsRes = await fetch("/api/pockets");
      if (pocketsRes.ok) {
        const pocketsData = await pocketsRes.json();
        setPockets(pocketsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create expense";
      setError(errorMessage);
      throw err;
    }
  };

  const updateExpense = async (id: string, pocketId: string, amount: number, description: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update expense");
      }

      const updatedExpense = await response.json();
      setExpenses(expenses.map((e) => (e.id === id ? updatedExpense : e)));

      // Refresh pockets to get updated balance
      const pocketsRes = await fetch("/api/pockets");
      if (pocketsRes.ok) {
        const pocketsData = await pocketsRes.json();
        setPockets(pocketsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update expense";
      setError(errorMessage);
      throw err;
    }
  };

  const addNeed = async (title: string, amount: number, priority: "high" | "medium" | "low") => {
    try {
      setError(null);
      const response = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount, priority }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create need");
      }

      const newNeed = await response.json();
      setNeeds([newNeed, ...needs]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create need";
      setError(errorMessage);
      throw err;
    }
  };

  const updateNeed = async (id: string, title: string, amount: number, priority: "high" | "medium" | "low") => {
    try {
      setError(null);
      const response = await fetch(`/api/needs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount, priority }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update need");
      }

      const updatedNeed = await response.json();
      setNeeds(needs.map((n) => (n.id === id ? updatedNeed : n)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update need";
      setError(errorMessage);
      throw err;
    }
  };

  const addIncome = async (pocketId: string, amount: number, description: string) => {
    try {
      setError(null);
      const response = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pocketId, amount, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create income record");
      }

      const newIncome = await response.json();
      setIncome([newIncome, ...income]);

      // Refresh pockets to get updated balance
      const pocketsRes = await fetch("/api/pockets");
      if (pocketsRes.ok) {
        const pocketsData = await pocketsRes.json();
        setPockets(pocketsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create income record";
      setError(errorMessage);
      throw err;
    }
  };

  const updateIncome = async (id: string, pocketId: string, amount: number, description: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/income/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update income record");
      }

      const updatedIncome = await response.json();
      setIncome(income.map((i) => (i.id === id ? updatedIncome : i)));

      // Refresh pockets to get updated balance
      const pocketsRes = await fetch("/api/pockets");
      if (pocketsRes.ok) {
        const pocketsData = await pocketsRes.json();
        setPockets(pocketsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update income record";
      setError(errorMessage);
      throw err;
    }
  };

  const deletePocket = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/pockets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete pocket");
      }

      setPockets(pockets.filter((p) => p.id !== id));
      setExpenses(expenses.filter((e) => e.pocketId !== id));
      setIncome(income.filter((i) => i.pocketId !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete pocket";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete expense");
      }

      setExpenses(expenses.filter((e) => e.id !== id));

      // Refresh pockets to get updated balance
      const pocketsRes = await fetch("/api/pockets");
      if (pocketsRes.ok) {
        const pocketsData = await pocketsRes.json();
        setPockets(pocketsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete expense";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/income/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete income record");
      }

      setIncome(income.filter((i) => i.id !== id));

      // Refresh pockets to get updated balance
      const pocketsRes = await fetch("/api/pockets");
      if (pocketsRes.ok) {
        const pocketsData = await pocketsRes.json();
        setPockets(pocketsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete income record";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteNeed = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/needs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete need");
      }

      setNeeds(needs.filter((n) => n.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete need";
      setError(errorMessage);
      throw err;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <AppContext.Provider
      value={{
        pockets,
        expenses,
        income,
        needs,
        isLoading,
        error,
        addPocket,
        updatePocket,
        addExpense,
        updateExpense,
        addIncome,
        updateIncome,
        addNeed,
        updateNeed,
        deletePocket,
        deleteExpense,
        deleteIncome,
        deleteNeed,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
