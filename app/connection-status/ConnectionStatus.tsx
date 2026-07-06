"use client";

import { useSyncExternalStore } from "react";

import { connectionStore } from "./connectionStore";

export const ConnectionStatus = () => {
    const conn = useSyncExternalStore(
        connectionStore.subscribe,
        connectionStore.getSnapshot,
        connectionStore.getServerSnapshot
    );

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Connection Status
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    A status pill fed by a hand-rolled external store.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <span
                        data-testid="status-pill"
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            conn.online
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {conn.online ? "Online" : "Offline"} · {conn.latencyMs}
                        ms
                    </span>
                    <p className="mt-2 text-xs text-gray-500">
                        {conn.checks} checks recorded
                    </p>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => connectionStore.setOnline(false)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                            Go offline
                        </button>
                        <button
                            onClick={() => connectionStore.setOnline(true)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                            Go online
                        </button>
                        <button
                            onClick={() =>
                                connectionStore.recordPing(
                                    Math.round(20 + Math.random() * 80)
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
                        >
                            Ping
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};
