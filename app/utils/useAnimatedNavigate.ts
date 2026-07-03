"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Navigation with a send-off animation. Call `navigate(key, href)` from the
 * tapped element: `leavingKey` becomes that key so the element can play its
 * departure animation (and siblings can dim) while the route loads behind it.
 * Navigation fires partway through so the animation masks the load time.
 * Respects prefers-reduced-motion by navigating instantly.
 */
export function useAnimatedNavigate(delay = 450) {
  const router = useRouter();
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const busy = useRef(false);

  const navigate = (key: string, href: string) => {
    if (busy.current) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      router.push(href);
      return;
    }
    busy.current = true;
    navigator.vibrate?.(15);
    setLeavingKey(key);
    router.prefetch(href);
    // push at ~70% of the animation so the page is ready as it ends
    setTimeout(() => router.push(href), delay * 0.7);
    // release in case navigation is cancelled (e.g. back gesture)
    setTimeout(() => {
      busy.current = false;
      setLeavingKey(null);
    }, delay * 3);
  };

  return { leavingKey, navigate };
}
