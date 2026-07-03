"use client";

import AIInsights from "../components/AIInsights";
import BottomNav from "../components/BottomNav";
import SideNav from "../components/SideNav";
import Nav from "../components/Nav";

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black lg:pb-6 lg:pl-56">
      <SideNav />
      <Nav />
      <div className="mx-auto max-w-md lg:max-w-4xl px-4 pt-3 pb-6">
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

