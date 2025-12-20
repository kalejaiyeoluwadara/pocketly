import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemName: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemName,
  onPreviousPage,
  onNextPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={onPreviousPage}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          currentPage === 1
            ? "text-zinc-300 cursor-not-allowed dark:text-zinc-700"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>
      {/* <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 dark:text-zinc-600">
          ({totalItems} {totalItems === 1 ? itemName : `${itemName}s`})
        </span>
      </div> */}
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          currentPage === totalPages
            ? "text-zinc-300 cursor-not-allowed dark:text-zinc-700"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

