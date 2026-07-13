"use client";

import { ordinal, relativeDays } from "./captions";

const DAY_MS = 86_400_000;

const PLAYERS = [
    { name: "Mira", rank: 21 },
    { name: "Dev", rank: 22 },
    { name: "Kai", rank: 23 },
    { name: "Ana", rank: 11 },
];

// The demo pins "now" at module load — the captions only need a fixed
// reference point.
const NOW = Date.now();

export const RankCaption = () => {
    const now = NOW;

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Season Standings
                </h2>

                <ul className="space-y-1">
                    {PLAYERS.map((player) => (
                        <li
                            key={player.name}
                            data-testid="row"
                            className="rounded border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
                        >
                            {player.name} — {ordinal(player.rank)} place
                        </li>
                    ))}
                </ul>

                <p className="text-xs text-gray-700">
                    Last match: {relativeDays(now - 2 * DAY_MS, now)} · Next
                    match: {relativeDays(now + 2 * DAY_MS, now)}
                </p>
            </div>
        </main>
    );
};
