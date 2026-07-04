/**
 * Canonical expense categories, tuned for Nigerian spending reality.
 * Shared by forms (chips), API routes (validation/defaults), and insights.
 */

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Airtime & Data",
  "Bills & Utilities",
  "Rent & Housing",
  "Family Support",
  "Groceries & Market",
  "Health",
  "Entertainment",
  "Education",
  "Personal Care",
  "Giving & Faith",
  "Bank Charges",
  "Savings & Investments",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const DEFAULT_CATEGORY: ExpenseCategory = "Other";

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return (
    typeof value === "string" &&
    (EXPENSE_CATEGORIES as readonly string[]).includes(value)
  );
}

/** Emoji used on chips and breakdowns so categories scan at a glance. */
export const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  "Food & Dining": "🍛",
  Transport: "🚌",
  "Airtime & Data": "📱",
  "Bills & Utilities": "💡",
  "Rent & Housing": "🏠",
  "Family Support": "🤝",
  "Groceries & Market": "🛒",
  Health: "💊",
  Entertainment: "🎬",
  Education: "📚",
  "Personal Care": "✂️",
  "Giving & Faith": "🙏",
  "Bank Charges": "🏦",
  "Savings & Investments": "💰",
  Other: "🧾",
};

// Keyword table for instant client/server-side categorization. Nigerian
// staples (suya, danfo, okada, nepa, black tax...) are first-class here.
const KEYWORD_RULES: Array<[ExpenseCategory, string[]]> = [
  [
    "Food & Dining",
    [
      "food", "lunch", "dinner", "breakfast", "meal", "restaurant", "eat",
      "suya", "shawarma", "amala", "jollof", "buka", "snack", "drink",
      "cafe", "coffee", "pizza", "chicken", "rice", "bread", "chops",
    ],
  ],
  [
    "Transport",
    [
      "transport", "uber", "bolt", "taxi", "bus", "danfo", "okada", "keke",
      "brt", "fuel", "petrol", "diesel", "fare", "flight", "ride", "trip",
      "parking", "car wash",
    ],
  ],
  [
    "Airtime & Data",
    ["airtime", "data", "recharge", "mtn", "glo", "airtel", "9mobile", "sub"],
  ],
  [
    "Bills & Utilities",
    [
      "bill", "electricity", "nepa", "phcn", "prepaid", "meter", "water",
      "internet", "wifi", "starlink", "dstv", "gotv", "waste", "gas",
    ],
  ],
  [
    "Rent & Housing",
    ["rent", "house", "apartment", "landlord", "agent fee", "caution fee", "service charge"],
  ],
  [
    "Family Support",
    [
      "family", "mum", "mom", "dad", "sister", "brother", "aunty", "uncle",
      "black tax", "home support", "parents", "sibling",
    ],
  ],
  [
    "Groceries & Market",
    ["grocery", "groceries", "market", "foodstuff", "provisions", "supermarket", "shoprite"],
  ],
  [
    "Health",
    ["health", "hospital", "pharmacy", "drug", "medicine", "clinic", "doctor", "malaria", "test"],
  ],
  [
    "Entertainment",
    [
      "movie", "cinema", "netflix", "spotify", "game", "show", "concert",
      "club", "outing", "party", "hangout", "flex",
    ],
  ],
  [
    "Education",
    ["school", "tuition", "course", "book", "training", "exam", "lesson", "udemy"],
  ],
  [
    "Personal Care",
    ["haircut", "barber", "salon", "hair", "cream", "soap", "skincare", "clothes", "shoe", "cloth", "fashion", "laundry"],
  ],
  [
    "Giving & Faith",
    ["tithe", "offering", "church", "mosque", "zakat", "donation", "charity", "gift"],
  ],
  [
    "Bank Charges",
    ["charge", "charges", "bank fee", "sms fee", "stamp duty", "maintenance fee", "pos fee", "transfer fee"],
  ],
  [
    "Savings & Investments",
    ["savings", "invest", "piggyvest", "cowrywise", "ajo", "esusu", "contribution", "stock", "crypto"],
  ],
];

/**
 * Best-effort category from a free-text description. Instant and offline —
 * used to pre-select the category chip as the user types, and as the
 * server-side default when a client doesn't send a category.
 */
export function suggestCategory(description: string): ExpenseCategory {
  const desc = description.toLowerCase();
  for (const [category, keywords] of KEYWORD_RULES) {
    if (keywords.some((k) => desc.includes(k))) {
      return category;
    }
  }
  return DEFAULT_CATEGORY;
}
