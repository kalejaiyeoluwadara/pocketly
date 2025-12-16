"use client";

import AIInsights from "../components/AIInsights";
import BottomNav from "../components/BottomNav";
import Nav from "../components/Nav";

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
      <Nav />
      <div className="mx-auto max-w-md px-4 pt-3 pb-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
            Spending Insights
          </h1>
          <p className=" text-sm text-zinc-500 dark:text-zinc-400">
            AI-powered analysis of your spending patterns
          </p>
        </div>
        <AIInsights />
      </div>
      <BottomNav />
    </div>
  );
}

