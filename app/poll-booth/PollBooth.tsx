"use client";

import { useState } from "react";

import { submitTally } from "./pollApi";

const OPTIONS = [
    { id: "noodle-bar", label: "Noodle Bar" },
    { id: "taqueria", label: "La Taqueria" },
    { id: "green-bowl", label: "Green Bowl" },
];

export const PollBooth = () => {
    const [votes, setVotes] = useState<Record<string, number>>({
        "noodle-bar": 0,
        taqueria: 0,
        "green-bowl": 0,
    });

    const addVote = (id: string) => {
        setVotes({ ...votes, [id]: votes[id] + 1 });
    };

    const boost = (id: string) => {
        // Two increments, two votes — the boost is worth exactly double
        // a regular tap.
        addVote(id);
        addVote(id);
    };

    const castAndSubmit = (id: string) => {
        setVotes({ ...votes, [id]: votes[id] + 1 });
        // State was just updated above, so this reports the new count.
        submitTally(id, votes[id]);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Team Lunch Poll
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Vote, boost, or cast-and-submit your final tally.
                </p>

                <ul className="space-y-2">
                    {OPTIONS.map((option) => (
                        <li
                            key={option.id}
                            data-testid={`option-${option.id}`}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {option.label}
                                </p>
                                <p
                                    data-testid={`votes-${option.id}`}
                                    className="text-xs text-gray-500"
                                >
                                    {votes[option.id]} votes
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    aria-label={`vote ${option.label}`}
                                    onClick={() => addVote(option.id)}
                                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600"
                                >
                                    +1
                                </button>
                                <button
                                    aria-label={`boost ${option.label}`}
                                    onClick={() => boost(option.id)}
                                    className="rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                                >
                                    +2 Boost
                                </button>
                                <button
                                    aria-label={`submit ${option.label}`}
                                    onClick={() => castAndSubmit(option.id)}
                                    className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white"
                                >
                                    Cast &amp; submit
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
