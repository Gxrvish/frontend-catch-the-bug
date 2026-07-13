"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";

import { formatAmount, parseAmount } from "./money";

export const CurrencyInput = () => {
    const [amount, setAmount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // The field always shows the grouped amount, so the separators are right
    // on every keystroke.
    const display = formatAmount(amount);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAmount(parseAmount(event.target.value));
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-sm space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Payout Amount
                </h2>

                <input
                    ref={inputRef}
                    data-testid="amount"
                    inputMode="decimal"
                    value={display}
                    onChange={onChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-right text-lg text-gray-900"
                />

                <p className="text-sm text-gray-900">
                    Charging{" "}
                    <span data-testid="value" className="font-semibold">
                        {amount}
                    </span>{" "}
                    USD
                </p>
            </div>
        </main>
    );
};
