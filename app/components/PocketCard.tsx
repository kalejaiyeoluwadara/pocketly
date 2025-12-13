"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import moment from "moment";
import { WalletIcon } from "../icons";
import { Pocket } from "../types";
import { formatCurrency } from "../utils/currency";
import { ChevronRightIcon } from "lucide-react";

interface PocketCardProps {
  pocket: Pocket;
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

export default function PocketCard({ pocket }: PocketCardProps) {
  const isNegative = pocket.balance < 0;
  const colors = getColorClasses(pocket.name);

  return (
    <Link href={`/pocket/${pocket.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-xl border border-zinc-200/50 bg-white p-3 shadow-elevated transition-all duration-300 hover:shadow-elevated-lg dark:border-zinc-800/50 dark:bg-zinc-900"
      >
        {/* Colored accent bar */} 
        <div className={`absolute left-0 top-0 h-full w-1 ${colors.bg}`} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`relative rounded-md ${colors.bg} p-2 transition-transform duration-300 group-hover:scale-110`}
            >
              <WalletIcon size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {pocket.name}
              </h3>
              <p className="text-[6px] text-zinc-500 dark:text-zinc-400">
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
              <ChevronRightIcon
                size={16}
                className="text-zinc-500   ml-1 dark:text-zinc-400"
              />
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
