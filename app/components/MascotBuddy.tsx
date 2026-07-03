"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Mascot from "./Mascot";
import { useApp } from "../context/AppContext";

const TAP_LINES = [
  "Hehe, that tickles!",
  "Coins secured.",
  "Careful, I'm full of money!",
  "Do that again!",
  "You sabi press person belle!",
];

/**
 * A small, restless Pocket who paces his stage, stops to juggle a coin,
 * and gists about your money. Walking is one CSS animation (transform
 * only); JS only flips lightweight state on slow timers.
 */
export default function MascotBuddy() {
  const { pockets, expenses, income, needs } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [tapLine, setTapLine] = useState<string | null>(null);
  const [onBreak, setOnBreak] = useState(false);
  const tapCount = useRef(0);

  const totalBalance = pockets.reduce((s, p) => s + p.balance, 0);
  const today = new Date();
  const hour = today.getHours();
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
    hour < 12
      ? "Morning! Make today's money make sense"
      : hour < 17
      ? "Afternoon check-in — how your pocket dey?"
      : "Evening o! Come make we count today's money",
    todaySpent > 0
      ? `₦${todaySpent.toLocaleString()} don comot today. I dey watch o`
      : "You never spend today? Discipline!",
    // salary-week gist (25th → 3rd)
    ...(dayOfMonth >= 25
      ? [
          "Salary week loading... hold strong, we dey almost there",
          "End of month vibes — budget no go beat us this time.",
        ]
      : dayOfMonth <= 3
      ? [
          "Alert don land? Abeg feed your pockets first",
          "New month, new budget. Make we plan am well!",
        ]
      : dayOfMonth >= 12 && dayOfMonth <= 18
      ? ["Mid-month check: how far with the budget?"]
      : []),
    daysSinceIncome !== null && daysSinceIncome > 14
      ? "Income side don quiet small... any gist?"
      : "Money wey enter must rest before e comot. House rule!",
    pendingNeeds.length > 0
      ? `${pendingNeeds.length} thing${pendingNeeds.length > 1 ? "s" : ""} still dey your needs list. We go buy am!`
      : "Needs list clear. Odogwu behavior!",
    pockets.length > 1
      ? `${pockets.length} pockets, one very organized human.`
      : "One pocket? Create more — separate money no dey mix gist.",
    totalBalance > 0
      ? "Your balance dey look comfy inside here"
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
        `${Math.max(track.clientWidth - 76, 0)}px`
      );
    };
    setWander();
    window.addEventListener("resize", setWander);
    return () => window.removeEventListener("resize", setWander);
  }, []);

  // rotate gist
  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => i + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // pace for a while, stop for a coin-juggling break, repeat
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const cycle = (breaking: boolean) => {
      timer = setTimeout(() => {
        setOnBreak(breaking);
        cycle(!breaking);
      }, breaking ? 10000 : 4500);
    };
    cycle(true);
    return () => clearTimeout(timer);
  }, []);

  const onTap = () => {
    setTapLine(TAP_LINES[tapCount.current++ % TAP_LINES.length]);
    setTimeout(() => setTapLine(null), 2200);
  };

  const message = tapLine ?? lines[msgIndex % lines.length];

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-white p-4 pb-0 shadow-elevated dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-900">
     

      {/* speech bubble with tail */}
      <div className="relative mb-4 w-fit max-w-full rounded-2xl rounded-bl-md border border-zinc-200/70 bg-white px-4 py-2.5 shadow-elevated dark:border-zinc-700/60 dark:bg-zinc-800">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {message}
          </motion.p>
        </AnimatePresence>
        <span className="absolute -bottom-[7px] left-5 h-3.5 w-3.5 rotate-45 border-b border-r border-zinc-200/70 bg-white dark:border-zinc-700/60 dark:bg-zinc-800" />
      </div>

      {/* stage */}
      <div ref={trackRef} className="relative h-[84px]">
        <div
          ref={walkerRef}
          onPointerDown={onTap}
          className="buddy-wander absolute bottom-1 left-0 w-[76px]"
          style={{ animationPlayState: onBreak ? "paused" : "running" }}
        >
          <div className={onBreak ? "" : "buddy-face"}>
            <Mascot mood={onBreak ? "counting" : "happy"} size={68} />
          </div>
        </div>
        {/* ground line */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-indigo-200/70 dark:border-indigo-900/50" />
      </div>
    </div>
  );
}
