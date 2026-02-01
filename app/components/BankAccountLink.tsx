"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link2Icon, Loader2Icon } from "../icons";
import { useApp } from "../context/AppContext";
import { useSession } from "next-auth/react";

export interface BankAccountLinkRef {
  open: () => void;
}

interface BankAccountLinkProps {
  onSuccess?: () => void;
}

// Declare the Mono Connect type
declare global {
  interface Window {
    Connect: any;
  }
}

export default function BankAccountLink({ onSuccess }: BankAccountLinkProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Mono Connect script
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById("mono-connect-script")) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "mono-connect-script";
    script.src = "https://connect.withmono.com/connect.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Mono Connect script");
      toast.error("Failed to load Mono Connect. Please refresh the page.");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.getElementById("mono-connect-script");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleLinkAccount = async () => {
    if (!isScriptLoaded) {
      toast.error("Mono Connect is still loading. Please try again.");
      return;
    }

    if (!session?.user) {
      toast.error("Please sign in to link a bank account.");
      return;
    }

    try {
      setIsLoading(true);

      // Get Mono public key from environment
      const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("Mono public key is not configured");
      }

      // Initialize Mono Connect Widget
      const monoConnect = new window.Connect({
        key: publicKey,
        scope: "auth",
        data: {
          customer: {
            name: session.user.name || "User",
            email: session.user.email || "",
          },
        },
        onSuccess: async (response: { code: string }) => {
          try {
            // Exchange code for account
            const exchangeResponse = await fetch(
              "/api/bank-accounts/link/callback",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: response.code }),
              }
            );

            if (!exchangeResponse.ok) {
              const error = await exchangeResponse.json();
              throw new Error(error.error || "Failed to link account");
            }

            toast.success("Bank account linked successfully!");
            setIsLoading(false);

            // Call onSuccess callback to refresh the account list
            if (onSuccess) {
              onSuccess();
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to link account";
            toast.error(errorMessage);
            setIsLoading(false);
          }
        },
        onClose: () => {
          setIsLoading(false);
        },
        onLoad: () => {
          console.log("Mono Connect widget loaded");
        },
        onEvent: (eventName: string, data: any) => {
          console.log("Mono Connect event:", eventName, data);
          
          // Handle specific events
          if (eventName === "ERROR") {
            toast.error(data.errorMessage || "An error occurred");
            setIsLoading(false);
          }
        },
      });

      // Setup and open the widget
      monoConnect.setup();
      monoConnect.open();
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
      disabled={isLoading || !isScriptLoaded}
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
