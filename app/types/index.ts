export type Priority = "high" | "medium" | "low";

export type NotificationType =
  | "pocket_created"
  | "pocket_deleted"
  | "pocket_balance_negative"
  | "pocket_balance_positive"
  | "expense_created"
  | "expense_updated"
  | "expense_deleted"
  | "income_created"
  | "income_updated"
  | "income_deleted"
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

export interface Income {
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
  completed: boolean;
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
    incomeId?: string;
    needId?: string;
    amount?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  monoAccountId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountType?: string;
  currency: string;
  balance?: number;
  isActive: boolean;
  syncStatus: "active" | "expired" | "error";
  lastSyncAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  userId: string;
  bankAccountId: string;
  monoTransactionId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  category?: string;
  date: string;
  balance?: number;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}
