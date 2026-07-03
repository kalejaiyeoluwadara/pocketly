"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import moment from "moment";
import { WalletIcon } from "../icons";
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

// Generate a color based on pocket name for consistency
const getColorClasses = (name: string) => {
  const colors = [
    {
      bg: "bg-indigo-500",
      text: "text-indigo-500",
      border: "border-indigo-500",
    },
    { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
    {
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      border: "border-emerald-500",
    },
    { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
    { bg: "bg-pink-500", text: "text-pink-500", border: "border-pink-500" },
    {
      bg: "bg-violet-500",
      text: "text-violet-500",
      border: "border-violet-500",
    },
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function PocketCard({
  pocket,
  onPress,
  leaving = false,
  dimmed = false,
}: PocketCardProps) {
  const isNegative = pocket.balance < 0;
  const colors = getColorClasses(pocket.name);
  const href = `/pocket/${pocket.id}`;

  const card = (
    <motion.div
      whileHover={!leaving && !dimmed ? { scale: 1.02, y: -2 } : {}}
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
      className={`group relative overflow-visible rounded-xl border bg-white p-3 shadow-elevated transition-shadow duration-300 dark:bg-zinc-900 ${
        leaving
          ? `${colors.border} shadow-elevated-lg`
          : "border-zinc-200/50 hover:shadow-elevated-lg dark:border-zinc-800/50"
      } ${onPress ? "cursor-pointer" : ""}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {/* Colored accent bar */}
        <div className={`absolute left-0 top-0 h-full w-1 ${colors.bg}`} />
      </div>

      {/* coins tipping out of the pocket on departure */}
      {leaving && (
        <div className="pointer-events-none absolute left-4 top-0 z-10">
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

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              leaving ? { rotate: [0, -12, 10, 0], scale: [1, 1.25, 1.1] } : {}
            }
            transition={{ duration: 0.45 }}
            className={`relative rounded-md ${colors.bg} p-2 transition-transform duration-300 group-hover:scale-110`}
          >
            <WalletIcon size={14} className="text-white" />
          </motion.div>
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {pocket.name}
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {moment(pocket.createdAt).format("MMM D, YYYY")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-medium flex items-center  transition-colors ${
              isNegative ? "text-red-500" : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            <span className="text-[11px] mt-[2px] mr-1">₦</span>{" "}
            <span>
              {pocket.balance.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <motion.span
              animate={leaving ? { x: [0, 8], opacity: [1, 0] } : {}}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ChevronRightIcon
                size={16}
                className="text-zinc-500   ml-1 dark:text-zinc-400"
              />
            </motion.span>
          </p>
        </div>
      </div>
    </motion.div>
  );

  return onPress ? card : <Link href={href}>{card}</Link>;
}
