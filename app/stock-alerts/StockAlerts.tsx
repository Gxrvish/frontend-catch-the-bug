"use client";

import { useState } from "react";

import { FeedPanel } from "./FeedPanel";
import type { Tick } from "./priceFeed";

const WATCHED = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
];

const WATCHED_SYMBOLS = WATCHED.map((entry) => entry.symbol);

export const StockAlerts = () => {
    const [filter, setFilter] = useState("");
    const [alerts, setAlerts] = useState<Tick[]>([]);

    const visible = WATCHED.filter((entry) =>
        entry.symbol.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Stock Alerts
                </h2>

                <FeedPanel
                    // A fresh object each render carries exactly what we
                    // want to watch right now — nothing stale.
                    options={{ symbols: WATCHED_SYMBOLS }}
                    // The arrow just forwards ticks into state.
                    onAlert={(tick) => setAlerts((prev) => [...prev, tick])}
                />

                <input
                    aria-label="filter symbols"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter watchlist"
                    className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                />

                <ul className="mb-4 space-y-1">
                    {visible.map((entry) => (
                        <li
                            key={entry.symbol}
                            data-testid="watch-row"
                            className="flex justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800"
                        >
                            <span className="font-medium">{entry.symbol}</span>
                            <span className="text-gray-500">{entry.name}</span>
                        </li>
                    ))}
                </ul>

                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Alerts
                </h3>
                <ul className="space-y-1">
                    {alerts.map((alert, i) => (
                        <li
                            key={`${alert.symbol}-${i}`}
                            data-testid="alert-row"
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"
                        >
                            {alert.symbol} @ {alert.price}
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
