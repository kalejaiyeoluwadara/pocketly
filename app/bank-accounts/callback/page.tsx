"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Callback page for Mono Connect OAuth flow in popup
 * Receives the code from Mono, exchanges it, and posts message to parent window
 */
export default function BankAccountCallbackPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Get params directly from URL (more reliable than useSearchParams in popups)
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash
      ? new URLSearchParams(window.location.hash.substring(1))
      : null;

    // Log all URL parameters for debugging
    console.log(
      "Callback page URL search params:",
      Object.fromEntries(urlParams.entries())
    );
    if (urlHash) {
      console.log(
        "Callback page URL hash params:",
        Object.fromEntries(urlHash.entries())
      );
    }
    console.log("Full URL:", window.location.href);

    // Try to get code from multiple sources
    const code =
      searchParams.get("code") ||
      urlParams.get("code") ||
      (urlHash ? urlHash.get("code") : null) ||
      // Also check for other possible parameter names Mono might use
      searchParams.get("auth_code") ||
      urlParams.get("auth_code") ||
      (urlHash ? urlHash.get("auth_code") : null);

    const isPopup =
      searchParams.get("popup") === "true" ||
      urlParams.get("popup") === "true" ||
      (urlHash ? urlHash.get("popup") === "true" : false);

    console.log("Extracted code:", code);
    console.log("Is popup:", isPopup);

    if (!code) {
      // Log error details before sending message
      console.error(
        "No code found in URL. Available params:",
        Object.fromEntries(urlParams.entries())
      );

      // No code means user cancelled or error occurred
      if (isPopup && window.opener) {
        window.opener.postMessage(
          {
            type: "MONO_ACCOUNT_LINK_ERROR",
            error:
              "No authorization code received. The linking process may have been cancelled.",
          },
          window.location.origin
        );
      }
      // Don't close immediately - give a small delay for the message to be sent
      setTimeout(() => {
        window.close();
      }, 500);
      return;
    }

    // Exchange code for account
    const handleCallback = async () => {
      try {
        const response = await fetch("/api/bank-accounts/link/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to link account");
        }

        // Notify parent window of success
        if (isPopup && window.opener) {
          window.opener.postMessage(
            {
              type: "MONO_ACCOUNT_LINKED",
              success: true,
            },
            window.location.origin
          );
        }

        // Close popup after a short delay to ensure message is sent
        setTimeout(() => {
          window.close();
        }, 500);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to link account";

        // Notify parent window of error
        if (isPopup && window.opener) {
          window.opener.postMessage(
            {
              type: "MONO_ACCOUNT_LINK_ERROR",
              error: errorMessage,
            },
            window.location.origin
          );
        }

        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      }
    };

    handleCallback();
  }, [searchParams, isProcessing]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Completing account linking...
        </div>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    </div>
  );
}
