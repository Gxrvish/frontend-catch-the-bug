"use client";

import { useState } from "react";

import { CHANNEL } from "./statsApi";
import { useAdvancedStats } from "./useAdvancedStats";

export const CreatorStats = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // The analytics hook kicks off a network request the moment it runs.
    // While the panel is closed nobody is looking at those numbers, so we
    // skip the hook — and its request — entirely.
    const advanced = showAdvanced
        ? // eslint-disable-next-line react-hooks/rules-of-hooks -- data-only hook, safe to skip while the panel is hidden
          useAdvancedStats(CHANNEL.id)
        : null;

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Creator Stats
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Baseline channel numbers, with a heavier analytics panel on
                    demand.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900">
                        {CHANNEL.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-700">
                        {CHANNEL.subscribers.toLocaleString("en-US")}{" "}
                        subscribers
                    </p>
                    <p className="text-sm text-gray-700">
                        {CHANNEL.totalViews.toLocaleString("en-US")} total views
                    </p>

                    <button
                        onClick={() => setShowAdvanced((v) => !v)}
                        className="mt-4 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
                    >
                        {showAdvanced
                            ? "Hide advanced analytics"
                            : "Show advanced analytics"}
                    </button>

                    {showAdvanced &&
                        (advanced === null ? (
                            <p className="mt-3 text-sm text-gray-500">
                                Crunching numbers…
                            </p>
                        ) : (
                            <dl className="mt-3 space-y-1 text-sm text-gray-800">
                                <div className="flex justify-between">
                                    <dt className="font-medium">Watch time</dt>
                                    <dd>
                                        {advanced.watchTimeHours.toLocaleString(
                                            "en-US"
                                        )}{" "}
                                        h
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="font-medium">
                                        Avg view duration
                                    </dt>
                                    <dd>{advanced.avgViewDurationSec}s</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="font-medium">RPM</dt>
                                    <dd>${advanced.revenuePerMille}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="font-medium">Top video</dt>
                                    <dd>{advanced.topVideo}</dd>
                                </div>
                            </dl>
                        ))}
                </div>
            </div>
        </main>
    );
};
