export type Priority = "high" | "medium" | "low";

export interface Pocket {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  pocketId: string;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Need {
  id: string;
  title: string;
  amount: number;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

