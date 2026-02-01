"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Callback page for Mono Connect (legacy/fallback)
 * The new implementation uses the Mono Connect Widget which handles callbacks internally
 * This page is kept for backward compatibility or webhook redirects
 */
export default function BankAccountCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // If somehow user lands here, redirect them back to bank accounts page
    const timer = setTimeout(() => {
      router.push("/bank-accounts");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Redirecting...
        </div>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    </div>
  );
}
