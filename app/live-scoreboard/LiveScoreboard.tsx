"use client";

import { useEffect, useState } from "react";

import { connectScoreFeed, MATCH } from "./scoreSocket";

export const LiveScoreboard = () => {
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [lastNote, setLastNote] = useState("Kick-off");

    useEffect(() => {
        // The relay runs over TCP, so events arrive in the order they were
        // sent — each incoming event is simply the latest truth.
        const disconnect = connectScoreFeed((event) => {
            setScore({ home: event.home, away: event.away });
            setLastNote(event.note);
        });
        return disconnect;
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Live Match Center
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Scores stream in over the realtime relay.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                    <p
                        data-testid="scoreline"
                        className="text-2xl font-bold text-gray-900"
                    >
                        {MATCH.home} {score.home} – {score.away} {MATCH.away}
                    </p>
                    <p
                        data-testid="last-note"
                        className="mt-2 text-sm text-gray-600"
                    >
                        {lastNote}
                    </p>
                </div>
            </div>
        </main>
    );
};
