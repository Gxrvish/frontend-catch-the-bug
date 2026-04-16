"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
    type NotificationSimulationMode,
    resetNotificationSimulation,
    setNotificationSimulationMode,
} from "./notificationApi";
import NotificationCenter from "./NotificationCenter";

const REPRO_SEED_COUNT = 4;
const RANDOM_POLL_INTERVAL_MS = 3000;
const REPRO_POLL_INTERVAL_MS = 2500;

export default function NotificationPage() {
    const [mode, setMode] = useState<NotificationSimulationMode>("repro");

    const seedCount = mode === "repro" ? REPRO_SEED_COUNT : 0;

    useEffect(() => {
        setNotificationSimulationMode(mode);
        resetNotificationSimulation(seedCount);
    }, [mode, seedCount]);

    const pollIntervalMs = useMemo(
        () =>
            mode === "repro" ? REPRO_POLL_INTERVAL_MS : RANDOM_POLL_INTERVAL_MS,
        [mode]
    );

    const handleModeChange = useCallback(
        (nextMode: NotificationSimulationMode) => {
            setMode(nextMode);
        },
        []
    );

    const handleResetRun = useCallback(() => {
        resetNotificationSimulation(seedCount);
    }, [seedCount]);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-xl mx-auto rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900 mb-4">
                    Notification Playground :)
                </h1>
                <p className="text-sm text-gray-600 mb-6">
                    Open the bell icon to see polling, optimistic updates, and
                    filters in action.
                </p>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleModeChange("repro")}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                            mode === "repro"
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Easy Repro Mode
                    </button>
                    <button
                        onClick={() => handleModeChange("random")}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                            mode === "random"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Random Mode
                    </button>
                    <button
                        onClick={handleResetRun}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reset Scenario
                    </button>
                </div>

                {mode === "repro" ? (
                    <ol className="mb-5 list-inside list-decimal rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900 space-y-1">
                        <li>Open the bell panel.</li>
                        <li>Click mark-as-read on any unread notification.</li>
                        <li>
                            Wait for the next poll (about 2.5s): it can flip
                            back to unread.
                        </li>
                        <li>
                            Wait one more poll: it returns to read when the
                            server write lands.
                        </li>
                    </ol>
                ) : (
                    <p className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                        Random mode keeps the original unpredictable simulation.
                    </p>
                )}

                <div className="flex justify-end">
                    <NotificationCenter pollIntervalMs={pollIntervalMs} />
                </div>
            </div>
        </main>
    );
}
