"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrainIcon, Loader2Icon, TrendingUpIcon, TrendingDownIcon, AlertCircleIcon } from "../icons";
import { formatCurrency } from "../utils/currency";
import EmptyState from "./EmptyState";

interface SpendingAnalysis {
  totalSpent: number;
  averagePerDay: number;
  averagePerExpense: number;
  totalExpenses: number;
  topCategories: Array<{ category: string; amount: number; count: number }>;
  spendingTrend: "increasing" | "decreasing" | "stable";
  monthlyBreakdown: Array<{ month: string; amount: number; count: number }>;
  anomalies: Array<{ description: string; severity: "high" | "medium" | "low" }>;
  insights: string[];
  recommendations: string[];
}

export default function AIInsights() {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/ai/insights");
        
        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load insights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon size={32} className="animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Analyzing your spending patterns...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircleIcon}
        iconColor="red"
        title="Failed to load insights"
        description={error}
      />
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={BrainIcon}
        iconColor="zinc"
        title="No insights available"
        description="Start tracking expenses to get personalized insights"
      />
    );
  }

  const TrendIcon = analysis.spendingTrend === "increasing" 
    ? TrendingUpIcon 
    : analysis.spendingTrend === "decreasing" 
    ? TrendingDownIcon 
    : null;
  
  const trendColor = analysis.spendingTrend === "increasing"
    ? "text-red-500"
    : analysis.spendingTrend === "decreasing"
    ? "text-green-500"
    : "text-zinc-500";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Spent</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(analysis.totalSpent)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg per Day</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(analysis.averagePerDay)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Expenses</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {analysis.totalExpenses}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg per Expense</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(analysis.averagePerExpense)}
          </p>
        </motion.div>
      </div>

      {/* Spending Trend */}
      {analysis.spendingTrend !== "stable" && TrendIcon && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2">
            <TrendIcon size={20} className={trendColor} />
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Spending Trend:{" "}
              <span className={trendColor}>
                {analysis.spendingTrend === "increasing" ? "Increasing" : "Decreasing"}
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Top Categories */}
      {analysis.topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Top Spending Categories
          </h3>
          <div className="space-y-3">
            {analysis.topCategories.map((category, index) => {
              const percentage = (category.amount / analysis.totalSpent) * 100;
              return (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {category.category}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {formatCurrency(category.amount)} ({category.count} expenses)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-red-500 to-red-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      {analysis.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-zinc-800 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <BrainIcon size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              AI Insights
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                <div className="flex-1 markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insight}
                  </ReactMarkdown>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-zinc-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-zinc-800 dark:from-green-900/20 dark:to-emerald-900/20"
        >
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="mt-1 text-green-600 dark:text-green-400">•</span>
                <div className="flex-1 markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {recommendation}
                  </ReactMarkdown>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Anomalies */}
      {analysis.anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertCircleIcon size={18} className="text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Spending Anomalies
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.anomalies.map((anomaly, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {anomaly.severity === "high" ? "⚠️ High" : anomaly.severity === "medium" ? "⚡ Medium" : "ℹ️ Low"}:
                </span>
                <div className="flex-1 prose prose-sm dark:prose-invert prose-p:my-0 prose-p:leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {anomaly.description}
                  </ReactMarkdown>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Monthly Breakdown */}
      {analysis.monthlyBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Monthly Breakdown
          </h3>
          <div className="space-y-2">
            {analysis.monthlyBreakdown.map((month, index) => {
              const maxAmount = Math.max(...analysis.monthlyBreakdown.map(m => m.amount));
              const percentage = (month.amount / maxAmount) * 100;
              return (
                <div key={month.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {month.month}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {formatCurrency(month.amount)} ({month.count} expenses)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.65 + index * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

