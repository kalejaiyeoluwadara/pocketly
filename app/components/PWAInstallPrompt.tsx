"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadIcon, SmartphoneIcon, XIcon } from "../icons";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasSeenPrompt = localStorage.getItem("pwa-install-prompt-dismissed");
    if (hasSeenPrompt) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobile = isIOSDevice || isAndroidDevice;

    // Skip if not mobile
    if (!isMobile) return;

    // For iOS, show instructions immediately
    if (isIOSDevice) {
      setIsIOS(true);
      setTimeout(() => setShowPrompt(true), 2000);
      return;
    }

    // For Android/Chrome - listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt for Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl border-t border-zinc-200/50 bg-white/95 backdrop-blur-xl p-6 pb-8 shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900/95"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-600 p-2 dark:bg-indigo-500">
                  <SmartphoneIcon size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Install Pocketly
                </h2>
              </div>
              <button
                onClick={handleDismiss}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <XIcon size={20} />
              </button>
            </div>

            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Install Pocketly on your device for a better experience and quick
              access.
            </p>

            <div className="space-y-4">
              {isIOS ? (
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Add to Home Screen on iOS:
                  </p>
                  <ol className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        1
                      </span>
                      <span>
                        Tap the <strong>Share</strong> button{" "}
                        <span className="inline-block">
                          <svg
                            className="inline-block h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                          </svg>
                        </span>{" "}
                        at the bottom (Safari)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        2
                      </span>
                      <span>
                        Scroll and tap{" "}
                        <strong>&quot;Add to Home Screen&quot;</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        3
                      </span>
                      <span>
                        Tap <strong>&quot;Add&quot;</strong> to confirm
                      </span>
                    </li>
                  </ol>
                  <button
                    onClick={handleDismiss}
                    className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Got it
                  </button>
                </div>
              ) : deferredPrompt ? (
                <>
                  <button
                    onClick={handleInstall}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <DownloadIcon size={18} />
                    Install Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Maybe Later
                  </button>
                </>
              ) : (
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Install on Android (Chrome):
                  </p>
                  <ol className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        1
                      </span>
                      <span>
                        Tap the <strong>menu</strong> (three dots) in the top
                        right
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        2
                      </span>
                      <span>
                        Select <strong>&quot;Add to Home screen&quot;</strong>{" "}
                        or <strong>&quot;Install app&quot;</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        3
                      </span>
                      <span>
                        Tap <strong>&quot;Install&quot;</strong> to confirm
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
