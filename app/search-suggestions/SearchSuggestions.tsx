"use client";

import { useState } from "react";

import type { SearchSimulationMode } from "./search.types";
import { useSearchSuggestions } from "./useSearchSuggestions";

export const SearchSuggestions = () => {
    const [query, setQuery] = useState("");
    const [simulationMode, setSimulationMode] =
        useState<SearchSimulationMode>("repro");

    const { suggestions, resultsForQuery, isLoading, requestLog } =
        useSearchSuggestions(query, { simulationMode });

    const isMismatch =
        query.trim() !== "" &&
        resultsForQuery !== "" &&
        resultsForQuery !== query.trim();

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Search Suggestions
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Type fast (e.g. &quot;iphone&quot;) and watch which query
                    the dropdown actually answers.
                </p>

                <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={simulationMode === "repro"}
                        onChange={(e) =>
                            setSimulationMode(
                                e.target.checked ? "repro" : "random"
                            )
                        }
                    />
                    Easy Repro Mode (short queries answer slower,
                    deterministically)
                </label>

                <div className="relative">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-blue-500"
                    />
                    {isLoading && (
                        <span className="absolute top-2.5 right-3 text-xs text-gray-400">
                            loading…
                        </span>
                    )}
                </div>

                {resultsForQuery !== "" && query.trim() !== "" && (
                    <p
                        className={`mt-2 text-xs ${
                            isMismatch
                                ? "font-semibold text-red-600"
                                : "text-gray-500"
                        }`}
                    >
                        Showing results for “{resultsForQuery}”
                        {isMismatch && ` — but you typed “${query.trim()}”!`}
                    </p>
                )}

                {suggestions.length > 0 && query.trim() !== "" && (
                    <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
                        {suggestions.map((s) => (
                            <li
                                key={s.id}
                                className="flex items-center justify-between px-4 py-2 text-sm text-gray-800"
                            >
                                <span>{s.text}</span>
                                <span className="text-xs text-gray-400">
                                    {s.category}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-6 rounded-lg bg-gray-50 p-3">
                    <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Request log (newest last)
                    </h3>
                    <ul className="space-y-1 font-mono text-xs text-gray-600">
                        {requestLog.map((entry) => (
                            <li key={entry.id}>
                                #{entry.id} “{entry.query}” —{" "}
                                {entry.status === "in-flight" ? (
                                    <span className="text-amber-600">
                                        in flight
                                    </span>
                                ) : (
                                    <span className="text-green-600">
                                        landed
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
};
