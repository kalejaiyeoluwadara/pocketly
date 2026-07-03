"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Mascot from "./Mascot";
import { useApp } from "../context/AppContext";

const TAP_LINES = [
  "Hehe, that tickles!",
  "Coins secured 🔒",
  "Careful, I'm full of money!",
  "Do that again 😄",
];

/**
 * A small, restless Pocket who paces the strip and chats about your money.
 * Wandering is one CSS animation (transform only); the only JS is the
 * message rotation timer.
 */
export default function MascotBuddy() {
  const { pockets, expenses, income, needs } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [tapLine, setTapLine] = useState<string | null>(null);
  const tapCount = useRef(0);

  const totalBalance = pockets.reduce((s, p) => s + p.balance, 0);
  const today = new Date();
  const dayOfMonth = today.getDate();
  const todaySpent = expenses
    .filter((e) => new Date(e.createdAt).toDateString() === today.toDateString())
    .reduce((s, e) => s + e.amount, 0);
  const daysSinceIncome = income[0]
    ? Math.floor((Date.now() - new Date(income[0].createdAt).getTime()) / 86400000)
    : null;
  const pendingNeeds = needs.filter((n) => !n.completed);

  // Nigerian money-gist, tuned to the calendar and the user's own numbers
  const lines = [
    "Every ₦ counts — I'm guarding them all 👀",
    todaySpent > 0
      ? `₦${todaySpent.toLocaleString()} don comot today. I dey watch o 📝`
      : "You never spend today? Discipline! 🫡",
    // salary-week gist (25th → 3rd)
    ...(dayOfMonth >= 25
      ? [
          "Salary week loading... hold strong, we dey almost there 💪",
          "End of month vibes — no let detty December budget catch you.",
        ]
      : dayOfMonth <= 3
      ? [
          "Alert don land? Abeg feed your pockets first 💸",
          "New month, new budget. Make we plan am well!",
        ]
      : dayOfMonth >= 12 && dayOfMonth <= 18
      ? ["Mid-month check: how far with the budget? 🧐"]
      : []),
    daysSinceIncome !== null && daysSinceIncome > 14
      ? "Income side don quiet small... any gist? 👀"
      : "Money wey enter must rest before e comot. House rule!",
    pendingNeeds.length > 0
      ? `${pendingNeeds.length} thing${pendingNeeds.length > 1 ? "s" : ""} still dey your needs list. We go buy am!`
      : "Needs list clear. Odogwu behavior! 🏆",
    pockets.length > 1
      ? `${pockets.length} pockets, one very organized human.`
      : "One pocket? Create more — separate money no dey mix gist.",
    totalBalance > 0
      ? "Your balance dey look comfy inside here 💅"
      : "E go better — we go bounce back. I believe in us!",
    "Small small savings dey grow big. Trust me, na me dey hold am.",
    "Log am the moment you spend am. Future you go thank you.",
  ];

  // measure how far Pocket can pace, keep it fresh on resize
  useEffect(() => {
    const setWander = () => {
      const track = trackRef.current;
      const walker = walkerRef.current;
      if (!track || !walker) return;
      walker.style.setProperty(
        "--wander-x",
        `${Math.max(track.clientWidth - 72, 0)}px`
      );
    };
    setWander();
    window.addEventListener("resize", setWander);
    return () => window.removeEventListener("resize", setWander);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => i + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const onTap = () => {
    setTapLine(TAP_LINES[tapCount.current++ % TAP_LINES.length]);
    setTimeout(() => setTapLine(null), 2200);
  };

  const message = tapLine ?? lines[msgIndex % lines.length];

  return (
    <div className="mb-8 rounded-2xl border border-zinc-200/50 bg-white p-4 shadow-elevated dark:border-zinc-800/50 dark:bg-zinc-900">
      {/* speech bubble */}
      <div className="mb-1 min-h-10 rounded-xl rounded-bl-sm bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-zinc-600 dark:text-zinc-300"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* pacing track */}
      <div ref={trackRef} className="relative h-[72px] overflow-hidden">
        <div
          ref={walkerRef}
          onPointerDown={onTap}
          className="buddy-wander absolute bottom-0 left-0 w-[72px]"
        >
          <div className="buddy-face">
            <Mascot mood="happy" size={64} />
          </div>
        </div>
      </div>
    </div>
  );
}
