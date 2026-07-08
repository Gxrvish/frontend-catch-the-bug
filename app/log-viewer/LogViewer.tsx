"use client";

import { seedLogs, TOTAL_ENTRIES } from "./logData";
import type { LogLevel } from "./logViewer.types";

export const ROW_HEIGHT = 28;
export const VIEWPORT_HEIGHT = 560;

const LOGS = seedLogs();

const LEVEL_STYLES: Record<LogLevel, string> = {
    info: "bg-gray-200 text-gray-700",
    warn: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-700",
};

export const LogViewer = () => (
    <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-2xl">
            <h2 className="mb-1 text-xl font-semibold text-gray-900">
                Ops Log Viewer
            </h2>
            <p className="mb-4 text-sm text-gray-600">
                {TOTAL_ENTRIES.toLocaleString("en-US")} entries · production ·
                last 24h
            </p>

            <div
                data-testid="log-scroller"
                style={{ height: VIEWPORT_HEIGHT }}
                className="overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm"
            >
                <ul>
                    {/* The list lives in an overflow-scroll container, so
                        off-screen rows are effectively free — the browser only
                        paints what is inside the viewport. */}
                    {LOGS.map((entry) => (
                        <li
                            key={entry.id}
                            data-testid="log-row"
                            style={{ height: ROW_HEIGHT }}
                            className="flex items-center gap-2 border-b border-gray-100 px-3 text-xs text-gray-800"
                        >
                            <span
                                className={`w-12 shrink-0 rounded px-1 py-0.5 text-center text-[10px] font-medium ${LEVEL_STYLES[entry.level]}`}
                            >
                                {entry.level}
                            </span>
                            <span className="truncate">{entry.message}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </main>
);
