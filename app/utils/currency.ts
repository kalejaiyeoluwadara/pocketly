/**
 * Formats a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted string with ₦ symbol (e.g., "₦1,234.56")
 */
export function formatCurrency(amount: number): string {
  return `₦${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Formats a number as Nigerian Naira currency without comma separators
 * @param amount - The amount to format
 * @returns Formatted string with ₦ symbol (e.g., "₦1234.56")
 */
export function formatCurrencySimple(amount: number): string {
  return `₦${amount.toFixed(2)}`;
}

