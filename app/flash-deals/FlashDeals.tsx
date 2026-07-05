"use client";

import { useEffect, useState } from "react";

import {
    DEALS,
    DEALS_END_AT,
    DISMISS_KEY,
    formatTimeLeft,
} from "./flashDealsData";

export const FlashDeals = () => {
    const [justDismissed, setJustDismissed] = useState(false);

    // Re-render every 100ms so the urgency timer visibly counts down.
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 100);
        return () => clearInterval(id);
    }, []);

    // How long the flash window still has, straight off the wall clock.
    // eslint-disable-next-line react-hooks/purity -- the timer re-renders every 100ms anyway, so reading the clock here is fine
    const msLeft = DEALS_END_AT - Date.now();

    // Respect an earlier dismissal on this device. The typeof guard keeps
    // this safe to evaluate on the server, where window doesn't exist.
    const dismissed =
        justDismissed ||
        (typeof window !== "undefined" &&
            window.localStorage.getItem(DISMISS_KEY) === "1");

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Flash Deals
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Run this with `npm run dev`, open the browser console, and
                    reload the page.
                </p>

                {dismissed ? (
                    <p className="text-sm text-gray-500">
                        Deals bar dismissed on this device.
                    </p>
                ) : (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-amber-900">
                                ⚡ Flash deals end in{" "}
                                <span
                                    data-testid="deal-countdown"
                                    className="font-mono"
                                >
                                    {formatTimeLeft(msLeft)}
                                </span>
                            </h3>
                            <button
                                aria-label="dismiss deals"
                                onClick={() => {
                                    window.localStorage.setItem(
                                        DISMISS_KEY,
                                        "1"
                                    );
                                    setJustDismissed(true);
                                }}
                                className="rounded px-2 text-amber-500 hover:bg-amber-100"
                            >
                                ✕
                            </button>
                        </div>
                        <ul className="grid grid-cols-3 gap-3">
                            {DEALS.map((deal) => (
                                <li
                                    key={deal.id}
                                    className="rounded-lg bg-white p-3 shadow-sm"
                                >
                                    <span className="block text-xs font-medium text-gray-900">
                                        {deal.name}
                                    </span>
                                    <span className="text-sm font-semibold text-amber-700">
                                        ${deal.price}
                                    </span>{" "}
                                    <span className="text-xs text-gray-400 line-through">
                                        ${deal.listPrice}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
};
