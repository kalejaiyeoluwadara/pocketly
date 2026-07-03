"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeftIcon } from "lucide-react";
import { EditPencilIcon, TrashBinIcon } from "../icons";
import moment from "moment";

interface Pocket {
  id: string;
  name: string;
  createdAt: string;
  balance: number;
}

interface PocketHeaderProps {
  pocket: Pocket;
  onUpdateClick: () => void;
  onDelete: () => void;
}

export default function PocketHeader({ pocket, onUpdateClick, onDelete }: PocketHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <section className="flex items-center gap-3">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => router.push("/")}
          aria-label="Back to pockets"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200/60 bg-white text-zinc-600 shadow-elevated transition-colors hover:text-zinc-900 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ChevronLeftIcon size={20} />
        </motion.button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {pocket.name}
          </h1>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Created {moment(pocket.createdAt).format("MMM D, YYYY")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onUpdateClick}
            aria-label="Edit pocket"
            className="group grid h-10 w-10 place-items-center rounded-full border border-zinc-200/60 bg-white text-zinc-500 shadow-elevated transition-colors hover:text-zinc-900 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <EditPencilIcon size={17} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onDelete}
            aria-label="Delete pocket"
            className="group grid h-10 w-10 place-items-center rounded-full border border-zinc-200/60 bg-white text-zinc-500 shadow-elevated transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <TrashBinIcon size={17} />
          </motion.button>
        </div>
      </section>
    </div>
  );
}
