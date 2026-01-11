"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import moment from "moment";
import { formatCurrency } from "../utils/currency";

interface Expense {
  id: string;
  amount: number;
  createdAt: string;
  description: string;
  pocketId: string;
}

interface Income {
  id: string;
  amount: number;
  createdAt: string;
  description: string;
  pocketId: string;
}

interface Pocket {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

interface BalanceHistoryChartProps {
  pocket: Pocket;
  expenses: Expense[];
  income: Income[];
}

// Helper function to format currency as string for Y-axis labels
function formatCurrencyString(amount: number): string {
  const formattedAmount = amount
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${formattedAmount}`;
}

export default function BalanceHistoryChart({
  pocket,
  expenses,
  income,
}: BalanceHistoryChartProps) {
  const chartData = (() => {
    // Calculate the initial balance when pocket was created
    // Current balance = initialBalance + totalIncome - totalExpenses
    // So: initialBalance = currentBalance - totalIncome + totalExpenses
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const initialBalance = pocket.balance - totalIncome + totalExpenses;

    // Combine and sort all transactions chronologically
    const allTransactions = [
      ...expenses.map((e) => ({
        ...e,
        type: "expense",
        amount: -e.amount,
      })),
      ...income.map((i) => ({
        ...i,
        type: "income",
        amount: i.amount,
      })),
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Start with initial balance at pocket creation
    const balanceHistory = [
      {
        date: moment(pocket.createdAt).format("MMM D"),
        balance: initialBalance,
        fullDate: pocket.createdAt,
      },
    ];

    // Apply transactions chronologically to build balance history
    let runningBalance = initialBalance;

    allTransactions.forEach((transaction) => {
      runningBalance += transaction.amount;
      balanceHistory.push({
        date: moment(transaction.createdAt).format("MMM D"),
        balance: runningBalance,
        fullDate: transaction.createdAt,
      });
    });

    // Add current balance point if different from last calculated balance
    // This handles cases where balance was manually updated or there are no transactions
    const lastBalance = balanceHistory[balanceHistory.length - 1].balance;
    if (Math.abs(lastBalance - pocket.balance) > 0.01) {
      balanceHistory.push({
        date: moment().format("MMM D"),
        balance: pocket.balance,
        fullDate: new Date().toISOString(),
      });
    }

    return balanceHistory;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 overflow-hidden"
    >
      <div className="rounded-xl border border-zinc-200/50 bg-white p-4 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Balance History
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: "black",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return moment(payload[0].payload.fullDate).format(
                      "MMM D, YYYY"
                    );
                  }
                  return label;
                }}
                formatter={(value: number | undefined) => [
                  formatCurrency(value ?? 0),
                  "Balance",
                ]}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
                activeDot={{
                  r: 5,
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
