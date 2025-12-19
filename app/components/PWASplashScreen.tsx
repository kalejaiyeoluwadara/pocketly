"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PWASplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export default function PWASplashScreen({
  onComplete,
  duration = 2000,
}: PWASplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if we've shown the splash screen before in this session
    const hasShownSplash = sessionStorage.getItem("pwa-splash-shown");

    if (hasShownSplash) {
      // Skip splash if already shown this session
      setIsVisible(false);
      onComplete?.();
      return;
    }

    // Show splash screen
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("pwa-splash-shown", "true");
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-black"
        >
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1], // Bounce effect
            }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/wallet-icon.svg"
                alt="Pocketly"
                width={120}
                height={120}
                priority
              />
            </motion.div>
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Pocketly
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Track your expenses with ease
            </p>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                  className="h-2 w-2 rounded-full bg-emerald-500"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
