"use client";

import { useState, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import NeedForm, { NeedFormRef } from "../components/NeedForm";
import NeedsList from "../components/NeedsList";
import BudgetOverview from "../components/BudgetOverview";
import BottomNav from "../components/BottomNav";
import SideNav from "../components/SideNav";
import { formatCurrency } from "../utils/currency";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 10;

export default function BudgetPage() {
  const { needs } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const needFormRef = useRef<NeedFormRef>(null);

  const activeNeeds = useMemo(
    () => needs.filter((need) => !need.completed),
    [needs]
  );
  const totalPlanned = activeNeeds.reduce((sum, need) => sum + need.amount, 0);

  // Pagination logic
  const totalPages = Math.ceil(needs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNeeds = needs.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 dark:bg-black lg:pb-6 lg:pl-56">
      <SideNav />
      <Nav />
      <div className="mx-auto max-w-md lg:max-w-3xl px-4 pt-3 pb-6">
        {/* This month's budgets and pace */}
        <BudgetOverview />

        {/* Planned spends */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Planned spends
            </h2>
            {activeNeeds.length > 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatCurrency(totalPlanned, true)} still to cover
              </p>
            )}
          </div>
          <div className="rounded-full border border-zinc-200 dark:border-zinc-800">
            <NeedForm ref={needFormRef} />
          </div>
        </div>

        <NeedsList
          needs={paginatedNeeds}
          onEmptyClick={() => needFormRef.current?.open()}
        />

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={needs.length}
          itemName="planned spend"
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
      <BottomNav />
    </div>
  );
}
