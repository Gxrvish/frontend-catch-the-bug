import { describe, expect, it } from "vitest";

import type { Line } from "./invoice";
import {
    formatLineTotal,
    invoiceTotal,
    qualifiesForFreeShipping,
} from "./invoice";

const line = (label: string, unitPrice: number, qty: number): Line => ({
    label,
    unitPrice,
    qty,
});

describe("invoice", () => {
    it("grants free shipping on a cart worth exactly the threshold", () => {
        // 1.60 + 8.95 + 5.50 + 3.95 is exactly $20.00.
        const lines = [
            line("Stickers", 1.6, 1),
            line("Notebook", 8.95, 1),
            line("Pen set", 5.5, 1),
            line("Tape", 3.95, 1),
        ];

        expect(qualifiesForFreeShipping(lines)).toBe(true);
    });

    it("rounds a half-cent line total up", () => {
        // 2.67/hr × 1.5h = 4.005 — invoices round half a cent up.
        expect(formatLineTotal(line("Support", 2.67, 1.5))).toBe("4.01");
    });

    it("totals whole-dollar lines exactly", () => {
        const lines = [
            line("Widget", 4, 2),
            line("Gadget", 3, 1),
            line("Cable", 1, 1),
        ];

        expect(invoiceTotal(lines)).toBe(12);
        expect(formatLineTotal(line("Widget", 4, 3))).toBe("12.00");
    });
});
