/**
 * Formats a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns JSX element with ₦ symbol in smaller font (e.g., "₦1,234.56")
 */
export function formatCurrency(amount: number, fontSize: string = "14px"): JSX.Element {
  const formattedAmount = amount
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <>
      <span className={`text-[${fontSize}] mr-[2px]`}>₦</span>
      {formattedAmount}
    </>
  );
}

/**
 * Formats a number as Nigerian Naira currency without comma separators
 * @param amount - The amount to format
 * @returns JSX element with ₦ symbol in smaller font (e.g., "₦1234.56")
 */
export function formatCurrencySimple(amount: number): JSX.Element {
  const formattedAmount = amount.toFixed(2);
  return (
    <>
      <span className="text-[0.85em]">₦</span>
      {formattedAmount}
    </>
  );
}
