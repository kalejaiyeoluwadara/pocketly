export type Priority = "high" | "medium" | "low";

export type NotificationType =
  | "pocket_created"
  | "pocket_deleted"
  | "pocket_balance_negative"
  | "expense_created"
  | "expense_updated"
  | "expense_deleted"
  | "need_created"
  | "need_updated"
  | "need_deleted";

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

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    pocketId?: string;
    expenseId?: string;
    needId?: string;
    amount?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

