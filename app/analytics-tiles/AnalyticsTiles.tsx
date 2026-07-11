"use client";

import { useState } from "react";

import { ACTIONS, DEVICE_LEGEND, STATS, TRAFFIC_LEGEND } from "./tileData";
import { ActionTile, Legend, StatTile, TileFrame } from "./tiles";

export const AnalyticsTiles = () => {
    const [refreshCount, setRefreshCount] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Store Analytics
                    </h2>
                    <button
                        onClick={() => setRefreshCount((n) => n + 1)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                        Refresh
                    </button>
                </div>
                <p className="mb-4 text-xs text-gray-500">
                    Refreshed {refreshCount}× · Selected:{" "}
                    <span data-testid="selected-tile">
                        {selectedId ?? "none"}
                    </span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {STATS.map((stat) => (
                        <StatTile
                            key={stat.id}
                            label={stat.label}
                            value={stat.value}
                            // The options never change — same keys, same
                            // values on every render — so the memoized tile
                            // sees identical props each time.
                            options={{ currency: "EUR", compact: true }}
                        />
                    ))}

                    {ACTIONS.map((tile) => (
                        <ActionTile
                            key={tile.id}
                            id={tile.id}
                            label={tile.label}
                            value={tile.value}
                            // The arrow only keeps the id in scope; the
                            // memoized tile sees the same function body on
                            // every render.
                            onSelect={() => setSelectedId(tile.id)}
                        />
                    ))}

                    <TileFrame title="Traffic sources">
                        {/* Static markup — these children are identical
                            between renders. */}
                        <Legend items={TRAFFIC_LEGEND} />
                    </TileFrame>
                    <TileFrame title="Devices">
                        <Legend items={DEVICE_LEGEND} />
                    </TileFrame>
                </div>
            </div>
        </main>
    );
};
