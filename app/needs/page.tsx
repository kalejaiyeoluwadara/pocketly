"use client";

import { useState, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import NeedForm, { NeedFormRef } from "../components/NeedForm";
import NeedsList from "../components/NeedsList";
import BottomNav from "../components/BottomNav";
import { formatCurrency } from "../utils/currency";
import Nav from "../components/Nav";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 10;

export default function NeedsPage() {
  const { needs } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const needFormRef = useRef<NeedFormRef>(null);

  const activeNeeds = useMemo(
    () => needs.filter((need) => !need.completed),
    [needs]
  );
  const completedNeeds = useMemo(
    () => needs.filter((need) => need.completed),
    [needs]
  );
  const totalNeeds = activeNeeds.reduce((sum, need) => sum + need.amount, 0);

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
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <Nav />
      <div className="mx-auto max-w-md px-4 pt-3 pb-6">
        <div className="mb-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total Needed
                </p>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="text-2xl">
                    <span className="text-lg mr-[2px]">₦</span>
                    {totalNeeds
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </p>
              </div>
              {completedNeeds.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Completed
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-500">
                    {completedNeeds.length}{" "}
                    {completedNeeds.length === 1 ? "need" : "needs"}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-start justify-start">
              <NeedForm ref={needFormRef} />
            </div>
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
          itemName="need"
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
      <BottomNav />
    </div>
  );
}
