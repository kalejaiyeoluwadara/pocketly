"use client";

import { useApp } from "../context/AppContext";
import NeedForm from "../components/NeedForm";
import NeedsList from "../components/NeedsList";
import BottomNav from "../components/BottomNav";
import { formatCurrency } from "../utils/currency";
import Nav from "../components/Nav";

export default function NeedsPage() {
  const { needs } = useApp();
  const totalNeeds = needs.reduce((sum, need) => sum + need.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <Nav />
      <div className="mx-auto max-w-md px-4 pt-3 pb-6">
        <div className="mb-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Needed
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              <span className="text-2xl">
                <span className="text-lg mr-[2px]">₦</span>
                {totalNeeds.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </p>
            <div className="mt-2 flex items-start justify-start">
              <NeedForm />
            </div>
          </div>
        </div>

        <NeedsList />
      </div>
      <BottomNav />
    </div>
  );
}
