"use client";

import { useState } from "react";

import { inviteFromUrl, inviteUrl } from "./shareCode";

export const ShareCode = () => {
    const [team, setTeam] = useState("qa~lab");
    const [result, setResult] = useState("");

    const roundTrip = () => {
        try {
            const url = inviteUrl({ team, seats: 5 });
            const back = inviteFromUrl(url);
            setResult(`Joined ${back.team} (${back.seats} seats)`);
        } catch (cause) {
            setResult(`Broken link: ${String(cause)}`);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Team Invite Links
                </h2>

                <input
                    data-testid="team"
                    value={team}
                    onChange={(event) => setTeam(event.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />

                <button
                    onClick={roundTrip}
                    className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                >
                    Create link and open it
                </button>

                {result && (
                    <p data-testid="result" className="text-sm text-gray-900">
                        {result}
                    </p>
                )}
            </div>
        </main>
    );
};
