import { memo, type ReactNode } from "react";

import type { LegendItem, StatOptions } from "./analyticsTiles.types";
import { tileProbes } from "./tileProbes";

const formatValue = (value: number, options: StatOptions) => {
    const symbol = options.currency === "EUR" ? "€" : "$";
    if (!options.compact) {
        return `${symbol}${value.toLocaleString("en-US")}`;
    }
    if (value >= 1_000_000) {
        return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${symbol}${(value / 1_000).toFixed(1)}k`;
    }
    return `${symbol}${value}`;
};

export const StatTile = memo(
    ({
        label,
        value,
        options,
    }: {
        label: string;
        value: number;
        options: StatOptions;
    }) => {
        // eslint-disable-next-line react-hooks/immutability -- perf-dashboard render probe, see tileProbes.ts
        tileProbes.stat += 1;

        return (
            <div
                data-testid="stat-tile"
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-semibold text-gray-900">
                    {formatValue(value, options)}
                </p>
            </div>
        );
    }
);
StatTile.displayName = "StatTile";

export const ActionTile = memo(
    ({
        id,
        label,
        value,
        onSelect,
    }: {
        id: string;
        label: string;
        value: string;
        onSelect: (id: string) => void;
    }) => {
        // eslint-disable-next-line react-hooks/immutability -- perf-dashboard render probe, see tileProbes.ts
        tileProbes.action += 1;

        return (
            <button
                data-testid="action-tile"
                onClick={() => onSelect(id)}
                className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300"
            >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-semibold text-gray-900">{value}</p>
            </button>
        );
    }
);
ActionTile.displayName = "ActionTile";

export const TileFrame = memo(
    ({ title, children }: { title: string; children: ReactNode }) => {
        // eslint-disable-next-line react-hooks/immutability -- perf-dashboard render probe, see tileProbes.ts
        tileProbes.frame += 1;

        return (
            <div
                data-testid="frame-tile"
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <p className="mb-2 text-xs font-medium text-gray-500">
                    {title}
                </p>
                {children}
            </div>
        );
    }
);
TileFrame.displayName = "TileFrame";

export const Legend = ({ items }: { items: LegendItem[] }) => (
    <ul className="space-y-1">
        {items.map((item) => (
            <li
                key={item.label}
                className="flex justify-between text-xs text-gray-700"
            >
                <span>{item.label}</span>
                <span className="font-medium">{item.share}</span>
            </li>
        ))}
    </ul>
);
