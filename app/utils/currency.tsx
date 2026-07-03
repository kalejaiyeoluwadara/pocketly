/**
 * Formats a number as Nigerian Naira currency string
 * @param amount - The amount to format
 * @returns Formatted string like "₦1,234.56"
 */
export function formatCurrencyString(amount: number): string {
  const formattedAmount = amount
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${formattedAmount}`;
}

/**
 * Formats a number as Nigerian Naira currency JSX
 * @param amount - The amount to format
 * @param smallSymbol - If true, renders ₦ slightly smaller than the amount
 * @returns JSX element with ₦ symbol (e.g., "₦1,234.56")
 */
export function formatCurrency(amount: number, smallSymbol: boolean = false): JSX.Element {
  const formattedAmount = amount
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <>
      <span className={smallSymbol ? "text-[0.8em] mr-[1px]" : ""}>₦</span>
      {formattedAmount}
    </>
  );
}
