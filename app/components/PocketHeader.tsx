"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete();
  };

  const handleUpdateClick = () => {
    setIsDropdownOpen(false);
    onUpdateClick();
  };

  return (
    <>
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ChevronLeftIcon
          size={30}
          className="text-zinc-500 dark:text-zinc-400"
        />
      </motion.button>

      <div className="mb-8">
        <section className="flex items-start justify-between">
          <div className="mb-6 ">
            <div className="flex-1">
              <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
                {pocket.name}
              </h1>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
                Created {moment(pocket.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-lg p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <MoreHorizontalIcon
                size={20}
                className="text-zinc-500 dark:text-zinc-400"
              />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-zinc-200/50 bg-white shadow-lg dark:border-zinc-800/50 dark:bg-zinc-900"
                >
                  <div className="py-1">
                    <button
                      onClick={handleUpdateClick}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <PencilIcon size={16} />
                      Update
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </>
  );
}