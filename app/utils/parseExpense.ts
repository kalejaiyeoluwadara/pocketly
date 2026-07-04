import { suggestCategory, ExpenseCategory } from "./categories";

export interface ParsedExpense {
  amount: number;
  description: string;
  category: ExpenseCategory;
}

/**
 * Parses one-line natural-language expense entries, e.g.:
 *   "2500 suya and drinks"
 *   "suya 2.5k"
 *   "bolt to island 4,500"
 *   "₦1500 airtime"
 *
 * The first amount-looking token (supports "2.5k" shorthand, commas, and a
 * leading ₦/N) becomes the amount; the rest of the line is the description.
 * Returns null when no amount can be found — callers can then fall back to
 * the full form or the AI parser.
 */
export function parseExpenseInput(input: string): ParsedExpense | null {
  const text = input.trim();
  if (!text) return null;

  // ₦ or standalone N prefix, digits with optional commas/decimal, optional k/m suffix
  const amountPattern = /(?:₦|\bN)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*([km])?\b/i;
  const match = text.match(amountPattern);
  if (!match) return null;

  let amount = parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2]?.toLowerCase();
  if (suffix === "k") amount *= 1_000;
  if (suffix === "m") amount *= 1_000_000;
  if (!isFinite(amount) || amount <= 0) return null;

  const description = (
    text.slice(0, match.index) + text.slice((match.index ?? 0) + match[0].length)
  )
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,\-–—]+|[\s,\-–—]+$/g, "")
    .trim();

  if (!description) return null;

  return {
    amount,
    description,
    category: suggestCategory(description),
  };
}
