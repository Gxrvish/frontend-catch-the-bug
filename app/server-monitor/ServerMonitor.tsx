"use client";

import { useEffect, useState } from "react";

import { refreshServer, type ServerId, SERVERS } from "./monitorApi";

// Fast tick for demo purposes — production uses 1s.
const TICK_MS = 200;

export const ServerMonitor = () => {
    const [seconds, setSeconds] = useState(0);
    const [selectedId, setSelectedId] = useState<ServerId>(SERVERS[0]);

    useEffect(() => {
        // The interval fires inside React, so each tick reads the
        // freshest render's value of `seconds`.
        const timer = setInterval(() => setSeconds(seconds + 1), TICK_MS);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- interval mounts once, see comment above
    }, []);

    useEffect(() => {
        // Register the hotkey once; the handler always sees the current
        // selection because React keeps `selectedId` up to date.
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "r") {
                refreshServer(selectedId);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- single registration, see comment above
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Fleet Monitor
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Session uptime: <span data-testid="uptime">{seconds}</span>s
                    · press{" "}
                    <kbd className="rounded border border-gray-300 bg-white px-1">
                        r
                    </kbd>{" "}
                    to refresh the selected server
                </p>

                <ul className="mb-4 space-y-2">
                    {SERVERS.map((server) => (
                        <li key={server}>
                            <button
                                onClick={() => setSelectedId(server)}
                                aria-pressed={server === selectedId}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                                    server === selectedId
                                        ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                        : "border-gray-200 bg-white text-gray-700"
                                }`}
                            >
                                {server}
                                {server === selectedId && (
                                    <span className="ml-2 text-xs text-indigo-500">
                                        selected
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => refreshServer(selectedId)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                    Refresh selected
                </button>
            </div>
        </main>
    );
};
