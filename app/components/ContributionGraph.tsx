"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { useApp } from "../context/AppContext";
import { Expense, Income } from "../types";
import { formatCurrency } from "../utils/currency";
import { TrendingUpIcon, TrendingDownIcon, XIcon } from "../icons";

interface DayData {
  date: Date;
  expenses: Expense[];
  income: Income[];
  totalExpenses: number;
  totalIncome: number;
  intensity: number; // 0-4 for color intensity
}

interface SelectedDay {
  date: Date;
  expenses: Expense[];
  income: Income[];
  totalExpenses: number;
  totalIncome: number;
}

export default function ContributionGraph() {
  const { expenses, income, pockets } = useApp();
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);

  // Generate the last 371 days (53 weeks)
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysArray: DayData[] = [];

    for (let i = 370; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split("T")[0];

      // Find expenses and income for this date
      const dayExpenses = expenses.filter((e) => {
        const expenseDate = new Date(e.createdAt);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.toISOString().split("T")[0] === dateStr;
      });

      const dayIncome = income.filter((i) => {
        const incomeDate = new Date(i.createdAt);
        incomeDate.setHours(0, 0, 0, 0);
        return incomeDate.toISOString().split("T")[0] === dateStr;
      });

      const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = dayIncome.reduce((sum, i) => sum + i.amount, 0);

      // Calculate intensity based on total activity
      // We'll use a combination of count and amount
      const activityCount = dayExpenses.length + dayIncome.length;
      const totalAmount = totalExpenses + totalIncome;

      let intensity = 0;
      if (activityCount > 0) {
        if (totalAmount < 1000) intensity = 1;
        else if (totalAmount < 5000) intensity = 2;
        else if (totalAmount < 20000) intensity = 3;
        else intensity = 4;
      }

      daysArray.push({
        date,
        expenses: dayExpenses,
        income: dayIncome,
        totalExpenses,
        totalIncome,
        intensity,
      });
    }

    return daysArray;
  }, [expenses, income]);

  // Group days by weeks (53 weeks)
  const weeks = useMemo(() => {
    const weeksArray: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }
    return weeksArray;
  }, [days]);

  // Get month labels - positioned like GitHub
  const monthLabels = useMemo(() => {
    const labels: { weekIndex: number; label: string; year?: string }[] = [];
    let lastMonth = "";
    let lastYear = "";

    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDay = week[0].date;
        const currentMonth = moment(firstDay).format("MMM");
        const currentYear = moment(firstDay).format("YYYY");

        // Add label if it's a new month or new year
        if (currentMonth !== lastMonth || currentYear !== lastYear) {
          lastMonth = currentMonth;
          lastYear = currentYear;
          // Only show year for January or if year changed
          const showYear = currentMonth === "Jan" || currentYear !== lastYear;
          labels.push({
            weekIndex,
            label: currentMonth,
            year: showYear ? currentYear : undefined,
          });
        }
      }
    });

    return labels;
  }, [weeks]);

  const getDayColor = (day: DayData): string => {
    if (day.intensity === 0) {
      return "bg-zinc-100 dark:bg-zinc-800";
    }

    const hasExpenses = day.expenses.length > 0;
    const hasIncome = day.income.length > 0;

    if (hasExpenses && hasIncome) {
      // Both spending and income - use a mixed color (purple/indigo)
      const colors = [
        "bg-indigo-200 dark:bg-indigo-900",
        "bg-indigo-300 dark:bg-indigo-800",
        "bg-indigo-400 dark:bg-indigo-700",
        "bg-indigo-500 dark:bg-indigo-600",
        "bg-indigo-600 dark:bg-indigo-500",
      ];
      return colors[day.intensity] || colors[0];
    } else if (hasExpenses) {
      // Only spending - red gradient
      const colors = [
        "bg-red-200 dark:bg-red-900",
        "bg-red-300 dark:bg-red-800",
        "bg-red-400 dark:bg-red-700",
        "bg-red-500 dark:bg-red-600",
        "bg-red-600 dark:bg-red-500",
      ];
      return colors[day.intensity] || colors[0];
    } else if (hasIncome) {
      // Only income - green gradient
      const colors = [
        "bg-emerald-200 dark:bg-emerald-900",
        "bg-emerald-300 dark:bg-emerald-800",
        "bg-emerald-400 dark:bg-emerald-700",
        "bg-emerald-500 dark:bg-emerald-600",
        "bg-emerald-600 dark:bg-emerald-500",
      ];
      return colors[day.intensity] || colors[0];
    }

    return "bg-zinc-100 dark:bg-zinc-800";
  };

  const handleDayClick = (day: DayData) => {
    if (day.expenses.length > 0 || day.income.length > 0) {
      setSelectedDay({
        date: day.date,
        expenses: day.expenses,
        income: day.income,
        totalExpenses: day.totalExpenses,
        totalIncome: day.totalIncome,
      });
    }
  };

  const getPocketName = (pocketId: string): string => {
    const pocket = pockets.find((p) => p.id === pocketId);
    return pocket?.name || "Unknown Pocket";
  };

  // Calculate totals for the period
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const activeDays = days.filter(
    (d) => d.expenses.length > 0 || d.income.length > 0
  ).length;

  return (
    <div className="rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
      {/* <div className="mb-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
          Activity Graph
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Track your spending and income over the past year
        </p>
      </div> */}

      

      {/* Graph Container */}
      <div className="overflow-x-auto">
        {/* Month labels - at the top, positioned like GitHub */}
        <div
          className="relative mb-2"
          style={{ height: "15px", paddingLeft: "32px" }}
        >
          {/* Month labels positioned absolutely */}
          {monthLabels.map(({ weekIndex, label, year }, idx) => {
            // Each week column: w-3 (12px) + gap-1 (4px) = 16px per week
            // Week 0 starts at 0, Week 1 at 16px, Week 2 at 32px, etc.
            const weekWidth = 16;
            const position = weekIndex * weekWidth;
            const nextWeekIndex =
              idx < monthLabels.length - 1
                ? monthLabels[idx + 1].weekIndex
                : weeks.length;
            const width = (nextWeekIndex - weekIndex) * weekWidth;

            return (
              <div
                key={`${weekIndex}-${label}`}
                className="absolute text-[10px] text-zinc-500 dark:text-zinc-400"
                style={{
                  left: `${position}px`,
                  width: `${width}px`,
                }}
              >
                {year ? `${label} ${year}` : label}
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 min-w-max">
          {/* Day labels - only Mon, Wed, Fri */}
          <div className="flex flex-col gap-1 mr-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, idx) => {
                // Only show Mon (1), Wed (3), Fri (5)
                if (idx === 1 || idx === 3 || idx === 5) {
                  return (
                    <div
                      key={day}
                      className="h-3 text-[10px] text-zinc-500 dark:text-zinc-400"
                    >
                      {day}
                    </div>
                  );
                }
                return <div key={day} className="h-3" />;
              }
            )}
          </div>

          {/* Weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <motion.button
                    key={`${weekIndex}-${dayIndex}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDayClick(day)}
                    className={`w-3 h-3 rounded-sm transition-all cursor-pointer ${
                      day.expenses.length > 0 || day.income.length > 0
                        ? "hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-600"
                        : "cursor-default"
                    } ${getDayColor(day)}`}
                    title={`${moment(day.date).format("MMM D, YYYY")}${
                      day.expenses.length > 0 || day.income.length > 0
                        ? `\n${
                            day.expenses.length > 0
                              ? `${
                                  day.expenses.length
                                } expense(s): ₦${day.totalExpenses
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                              : ""
                          }${
                            day.expenses.length > 0 && day.income.length > 0
                              ? "\n"
                              : ""
                          }${
                            day.income.length > 0
                              ? `${
                                  day.income.length
                                } income(s): ₦${day.totalIncome
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                              : ""
                          }`
                        : ""
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-700" />
          <span>Spending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-indigo-400 dark:bg-indigo-700" />
          <span>Both</span>
        </div>
      </div>

      {/* Modal for selected day */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedDay(null)}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-zinc-200/50 bg-white p-6 shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                      {moment(selectedDay.date).format("MMMM D, YYYY")}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {moment(selectedDay.date).format("dddd")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <XIcon size={20} />
                  </button>
                </div>

                {/* Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-800/50">
                  <div>
                    <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Total Income
                    </p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedDay.totalIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Total Spent
                    </p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(selectedDay.totalExpenses)}
                    </p>
                  </div>
                </div>

                {/* Transactions */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDay.income.length === 0 &&
                  selectedDay.expenses.length === 0 ? (
                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
                      No transactions on this day
                    </p>
                  ) : (
                    <>
                      {selectedDay.income.map((inc) => (
                        <motion.div
                          key={`income-${inc.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-3 dark:border-emerald-800/50 dark:bg-emerald-900/20"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="rounded-lg bg-emerald-500 p-2">
                              <TrendingUpIcon
                                size={16}
                                className="text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {inc.description}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {getPocketName(inc.pocketId)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(inc.amount)}
                          </span>
                        </motion.div>
                      ))}
                      {selectedDay.expenses.map((exp) => (
                        <motion.div
                          key={`expense-${exp.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between rounded-xl border border-zinc-200/50 bg-white p-3 dark:border-zinc-800/50 dark:bg-zinc-900"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="rounded-lg bg-red-600 p-2">
                              <TrendingDownIcon
                                size={16}
                                className="text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {exp.description}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {getPocketName(exp.pocketId)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(exp.amount)}
                          </span>
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
