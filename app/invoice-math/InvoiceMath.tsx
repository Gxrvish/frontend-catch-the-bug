"use client";

import type { Line } from "./invoice";
import {
    formatLineTotal,
    invoiceTotal,
    qualifiesForFreeShipping,
} from "./invoice";

const LINES: Line[] = [
    { label: "Stickers", unitPrice: 1.6, qty: 1 },
    { label: "Notebook", unitPrice: 8.95, qty: 1 },
    { label: "Pen set", unitPrice: 5.5, qty: 1 },
    { label: "Tape", unitPrice: 3.95, qty: 1 },
    { label: "Support (hrs)", unitPrice: 2.67, qty: 1.5 },
];

export const InvoiceMath = () => (
    <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-md space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>

            <table className="w-full text-sm text-gray-900">
                <tbody>
                    {LINES.map((line) => (
                        <tr key={line.label}>
                            <td className="py-1">{line.label}</td>
                            <td className="py-1 text-right">
                                {formatLineTotal(line)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="text-sm text-gray-900">
                Total:{" "}
                <span data-testid="total" className="font-semibold">
                    {invoiceTotal(LINES)}
                </span>
            </p>
            <p className="text-xs text-gray-700">
                Free shipping (first four items):{" "}
                <span data-testid="shipping">
                    {qualifiesForFreeShipping(LINES.slice(0, 4)) ? "yes" : "no"}
                </span>
            </p>
        </div>
    </main>
);
