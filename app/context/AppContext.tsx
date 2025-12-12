"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Pocket, Expense, Need } from "../types";

interface AppContextType {
  pockets: Pocket[];
  expenses: Expense[];
  needs: Need[];
  addPocket: (name: string, initialBalance: number) => void;
  addExpense: (pocketId: string, amount: number, description: string) => void;
  addNeed: (title: string, amount: number, priority: "high" | "medium" | "low") => void;
  deletePocket: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteNeed: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedPockets = localStorage.getItem("pockets");
      const savedExpenses = localStorage.getItem("expenses");
      const savedNeeds = localStorage.getItem("needs");

      if (savedPockets) setPockets(JSON.parse(savedPockets));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedNeeds) setNeeds(JSON.parse(savedNeeds));
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("pockets");
      localStorage.removeItem("expenses");
      localStorage.removeItem("needs");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes (client-side only)
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem("pockets", JSON.stringify(pockets));
    } catch (error) {
      console.error("Error saving pockets to localStorage:", error);
    }
  }, [pockets, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    } catch (error) {
      console.error("Error saving expenses to localStorage:", error);
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem("needs", JSON.stringify(needs));
    } catch (error) {
      console.error("Error saving needs to localStorage:", error);
    }
  }, [needs, isLoaded]);

  const addPocket = (name: string, initialBalance: number) => {
    const newPocket: Pocket = {
      id: crypto.randomUUID(),
      name,
      balance: initialBalance,
      createdAt: new Date().toISOString(),
    };
    setPockets([...pockets, newPocket]);
  };

  const addExpense = (pocketId: string, amount: number, description: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      pocketId,
      amount,
      description,
      createdAt: new Date().toISOString(),
    };
    setExpenses([newExpense, ...expenses]);
    
    // Update pocket balance
    setPockets(
      pockets.map((pocket) =>
        pocket.id === pocketId
          ? { ...pocket, balance: pocket.balance - amount }
          : pocket
      )
    );
  };

  const addNeed = (title: string, amount: number, priority: "high" | "medium" | "low") => {
    const newNeed: Need = {
      id: crypto.randomUUID(),
      title,
      amount,
      priority,
      createdAt: new Date().toISOString(),
    };
    setNeeds([...needs, newNeed]);
  };

  const deletePocket = (id: string) => {
    setPockets(pockets.filter((p) => p.id !== id));
    setExpenses(expenses.filter((e) => e.pocketId !== id));
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      setExpenses(expenses.filter((e) => e.id !== id));
      // Restore pocket balance
      setPockets(
        pockets.map((pocket) =>
          pocket.id === expense.pocketId
            ? { ...pocket, balance: pocket.balance + expense.amount }
            : pocket
        )
      );
    }
  };

  const deleteNeed = (id: string) => {
    setNeeds(needs.filter((n) => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        pockets,
        expenses,
        needs,
        addPocket,
        addExpense,
        addNeed,
        deletePocket,
        deleteExpense,
        deleteNeed,
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

