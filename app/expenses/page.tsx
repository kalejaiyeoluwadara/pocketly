"use client";

import { useState, useMemo, useRef } from "react";
import moment from "moment";
import { useApp } from "../context/AppContext";
import ExpenseForm, { ExpenseFormRef } from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BottomNav from "../components/BottomNav";
import SideNav from "../components/SideNav";
import { formatCurrency } from "../utils/currency";
import Nav from "../components/Nav";
import { Calendar, Search } from "lucide-react";
import Pagination from "../components/Pagination";
import { toast } from "sonner";

type FilterPeriod = "all" | "week" | "month";

const ITEMS_PER_PAGE = 10;

export default function ExpensesPage() {
  const { expenses, pockets } = useApp();
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const expenseFormRef = useRef<ExpenseFormRef>(null);

  // Filter expenses based on selected period and search query
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by period
    if (filterPeriod !== "all") {
      const now = moment();
      filtered = filtered.filter((expense) => {
        const expenseDate = moment(expense.createdAt);
        if (filterPeriod === "week") {
          return expenseDate.isSame(now, "week");
        } else if (filterPeriod === "month") {
          return expenseDate.isSame(now, "month");
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((expense) => {
        const pocketName =
          pockets.find((p) => p.id === expense.pocketId)?.name || "";
        return (
          expense.description.toLowerCase().includes(query) ||
          pocketName.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [expenses, filterPeriod, searchQuery, pockets]);

  // Calculate total for filtered expenses
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (period: FilterPeriod) => {
    setFilterPeriod(period);
    setCurrentPage(1);
    setSearchQuery(""); // Reset search when changing filters
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getFilterLabel = () => {
    if (filterPeriod === "week") return "This Week";
    if (filterPeriod === "month") return "This Month";
    return "All Time";
  };

  const handleEmptyStateClick = () => {
    if (pockets.length === 0) {
      toast.error("Please create a pocket first before adding expenses!");
      return;
    }
    expenseFormRef.current?.open();
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black lg:pb-6 lg:pl-56">
      <SideNav />
      <Nav />
      <div className="mx-auto max-w-md lg:max-w-3xl px-4 pt-3 pb-6">
        <div className="mb-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Spent
              </p>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Calendar className="w-3 h-3" />
                <span>{getFilterLabel()}</span>
              </div>
            </div>
            <p className="font-medium text-red-500">
              <span className="text-2xl">
                {formatCurrency(totalExpenses)}
              </span>
            </p>
            <div className="mt-4 flex items-start justify-start">
              <ExpenseForm ref={expenseFormRef} />
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search expenses by description or pocket..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-10 py-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              filterPeriod === "all"
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handleFilterChange("week")}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              filterPeriod === "week"
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleFilterChange("month")}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              filterPeriod === "month"
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
            }`}
          >
            This Month
          </button>
        </div>

        <ExpenseList
          expenses={paginatedExpenses}
          onEmptyClick={handleEmptyStateClick}
        />

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredExpenses.length}
          itemName="expense"
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
      <BottomNav />
    </div>
  );
}
