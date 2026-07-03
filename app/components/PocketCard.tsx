"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import moment from "moment";
import { PocketPouchIcon } from "../icons";
import { Pocket } from "../types";
import { ChevronRightIcon } from "lucide-react";

interface PocketCardProps {
  pocket: Pocket;
  /** When provided, tapping plays the send-off animation before navigating
   * (see useAnimatedNavigate). Without it, the card is a plain link. */
  onPress?: (key: string, href: string) => void;
  /** This card is currently animating out toward its page */
  leaving?: boolean;
  /** Another card is leaving — step back quietly */
  dimmed?: boolean;
}

// Consistent per-pocket accent, derived from the name
const getAccent = (name: string) => {
  const accents = [
    { tile: "from-indigo-400 to-indigo-600", wash: "bg-indigo-500", border: "border-indigo-500" },
    { tile: "from-blue-400 to-blue-600", wash: "bg-blue-500", border: "border-blue-500" },
    { tile: "from-emerald-400 to-emerald-600", wash: "bg-emerald-500", border: "border-emerald-500" },
    { tile: "from-amber-400 to-amber-600", wash: "bg-amber-500", border: "border-amber-500" },
    { tile: "from-pink-400 to-pink-600", wash: "bg-pink-500", border: "border-pink-500" },
    { tile: "from-violet-400 to-violet-600", wash: "bg-violet-500", border: "border-violet-500" },
  ];
  return accents[name.charCodeAt(0) % accents.length];
};

export default function PocketCard({
  pocket,
  onPress,
  leaving = false,
  dimmed = false,
}: PocketCardProps) {
  const isNegative = pocket.balance < 0;
  const accent = getAccent(pocket.name);
  const href = `/pocket/${pocket.id}`;

  const card = (
    <motion.div
      whileHover={!leaving && !dimmed ? { y: -2 } : {}}
      whileTap={!leaving ? { scale: 0.97 } : {}}
      animate={
        leaving
          ? {
              scale: [1, 0.96, 1.04, 1.02],
              y: [0, 2, -6, -4],
              transition: { duration: 0.45, times: [0, 0.25, 0.6, 1] },
            }
          : dimmed
          ? { opacity: 0.35, scale: 0.97 }
          : { opacity: 1, scale: 1 }
      }
      onClick={onPress ? () => onPress(pocket.id, href) : undefined}
      className={`group relative rounded-2xl border bg-white p-4 shadow-elevated transition-shadow duration-300 dark:bg-zinc-900 ${
        leaving
          ? `${accent.border} shadow-elevated-lg`
          : "border-zinc-200/50 hover:shadow-elevated-lg dark:border-zinc-800/50"
      } ${onPress ? "cursor-pointer" : ""}`}
    >
      {/* soft color wash bleeding from the pouch's corner */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className={`absolute -left-6 -top-6 h-20 w-20 rounded-full ${accent.wash} opacity-[0.08] blur-xl transition-opacity duration-300 group-hover:opacity-[0.16]`}
        />
      </div>

      {/* coins tipping out on departure */}
      {leaving && (
        <div className="pointer-events-none absolute left-6 top-0 z-10">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 6, x: i * 10, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-2, -22 - i * 6],
                x: [i * 10, i * 16 - 8],
                scale: 1,
              }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="absolute block h-3 w-3 rounded-full border border-amber-600 bg-amber-400"
            />
          ))}
        </div>
      )}

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            animate={
              leaving ? { rotate: [0, -12, 10, 0], scale: [1, 1.25, 1.1] } : {}
            }
            transition={{ duration: 0.45 }}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accent.tile} shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
          >
            <PocketPouchIcon size={24} className="text-white" />
          </motion.div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
              {pocket.name}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Since {moment(pocket.createdAt).format("MMM D, YYYY")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <p
            className={`font-display text-[17px] font-bold tracking-tight ${
              isNegative ? "text-red-500" : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            <span className="mr-0.5 align-[2px] text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
              ₦
            </span>
            {pocket.balance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <motion.span
            animate={leaving ? { x: [0, 8], opacity: [1, 0] } : {}}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="-mr-1 ml-0.5 text-zinc-300 transition-all duration-300 group-hover:ml-1.5 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400"
          >
            <ChevronRightIcon size={16} />
          </motion.span>
        </div>
      </div>
    </motion.div>
  );

  return onPress ? card : <Link href={href}>{card}</Link>;
}
