"use client";

import type { UseLivePricesOptions } from "./livePrices.types";
import { emitMarketTick } from "./pricesApi";
import { useLivePrices } from "./useLivePrices";

export const LivePrices = (options: UseLivePricesOptions = {}) => {
    const { prices, updateCount, listenerCount } = useLivePrices(options);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Live Prices
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Compare the updates counter with how many ticks actually
                    happen. Run this in dev mode.
                </p>

                <div className="mb-4 flex gap-2">
                    <span
                        data-testid="update-count"
                        className="rounded bg-indigo-100 px-2 py-1 font-mono text-xs text-indigo-700"
                    >
                        updates received: {updateCount}
                    </span>
                    <span
                        data-testid="listener-count"
                        className="rounded bg-purple-100 px-2 py-1 font-mono text-xs text-purple-700"
                    >
                        socket listeners: {listenerCount}
                    </span>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <tbody>
                            {Object.entries(prices).map(([symbol, price]) => (
                                <tr
                                    key={symbol}
                                    className="border-b border-gray-100 last:border-0"
                                >
                                    <td className="px-4 py-2 font-medium text-gray-900">
                                        {symbol}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-700">
                                        ${price.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={() => emitMarketTick()}
                    className="mt-4 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                >
                    Emit one market tick
                </button>
            </div>
        </main>
    );
};
