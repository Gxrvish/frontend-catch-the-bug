export type Line = {
    label: string;
    /** Unit price in dollars, e.g. 2.67. */
    unitPrice: number;
    /** Quantity — hours can be fractional. */
    qty: number;
};

export const FREE_SHIPPING_AT = 20;

/** One line's total, in dollars. */
export const lineTotal = (line: Line): number => line.unitPrice * line.qty;

/** The invoice total, in dollars. */
export const invoiceTotal = (lines: Line[]): number =>
    lines.reduce((sum, line) => sum + lineTotal(line), 0);

/** "4.01" — what gets printed on the invoice. */
export const formatLineTotal = (line: Line): string =>
    lineTotal(line).toFixed(2);

export const qualifiesForFreeShipping = (lines: Line[]): boolean =>
    invoiceTotal(lines) >= FREE_SHIPPING_AT;
