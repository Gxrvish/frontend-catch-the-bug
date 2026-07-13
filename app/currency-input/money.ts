/** Grouped in thousands, at most two decimals: 1234567 -> "1,234,567". */
export const formatAmount = (value: number): string =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** "1,234.50" -> 1234.5 ; garbage -> 0 */
export const parseAmount = (text: string): number => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const value = Number.parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
};
