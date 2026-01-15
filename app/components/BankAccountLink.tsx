"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2Icon, Loader2Icon } from "../icons";
import { useApp } from "../context/AppContext";

export interface BankAccountLinkRef {
  open: () => void;
}

interface BankAccountLinkProps {
  onSuccess?: () => void;
}

export default function BankAccountLink({ onSuccess }: BankAccountLinkProps) {
  const { linkBankAccount } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkAccount = async () => {
    try {
      setIsLoading(true);

      // Get redirect URL - for popup flow, we need a page that can receive the code
      const redirectUrl = `${window.location.origin}/bank-accounts/callback?popup=true`;

      // Initiate account linking
      const response = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate account linking");
      }

      const data = await response.json();
      const connectLink = data.connectLink;

      // Open Mono Connect in a popup or redirect
      if (connectLink) {
        // Open in new window for better UX
        const popup = window.open(
          connectLink,
          "Mono Connect",
          "width=600,height=700,scrollbars=yes,resizable=yes"
        );

        if (!popup) {
          setIsLoading(false);
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        // Listen for popup close or message from callback
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
            // Refresh bank accounts after popup closes
            if (onSuccess) {
              onSuccess();
            }
          }
        }, 1000);

        // Also listen for postMessage from callback page
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data.type === "MONO_ACCOUNT_LINKED") {
            clearInterval(checkClosed);
            setIsLoading(false);
            popup?.close();
            if (onSuccess) {
              onSuccess();
            }
            window.removeEventListener("message", handleMessage);
          } else if (event.data.type === "MONO_ACCOUNT_LINK_ERROR") {
            clearInterval(checkClosed);
            setIsLoading(false);
            popup?.close();
            window.removeEventListener("message", handleMessage);
            toast.error(event.data.error || "Failed to link account");
          }
        };

        window.addEventListener("message", handleMessage);

        // Cleanup on unmount
        return () => {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
        };
      } else {
        throw new Error("No connect link received");
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to link account";
      toast.error(errorMessage);
    }
  };

  return (
    <button
      onClick={handleLinkAccount}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2Icon size={18} className="animate-spin" />
          <span>Linking...</span>
        </>
      ) : (
        <>
          <Link2Icon size={18} />
          <span>Link Bank Account</span>
        </>
      )}
    </button>
  );
}
