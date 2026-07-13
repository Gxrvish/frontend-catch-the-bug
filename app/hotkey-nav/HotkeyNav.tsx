"use client";

import { useEffect, useState } from "react";

const ITEMS = ["Inbox", "Starred", "Snoozed", "Archive", "Trash"];

export const HotkeyNav = () => {
    const [index, setIndex] = useState(0);
    const [palette, setPalette] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            // j/k drive the list; ⌘K opens the command palette.
            if (event.key === "j") {
                setIndex((i) => Math.min(i + 1, ITEMS.length - 1));
            }
            if (event.key === "k") {
                setIndex((i) => Math.max(i - 1, 0));
            }
            if (event.key === "k" && event.metaKey) {
                setPalette(true);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Folders
                </h2>

                <input
                    data-testid="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search mail"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />

                <ul className="space-y-1">
                    {ITEMS.map((item, i) => (
                        <li
                            key={item}
                            data-testid="folder"
                            data-selected={i === index}
                            className={`rounded px-3 py-1 text-sm ${
                                i === index
                                    ? "bg-gray-900 text-white"
                                    : "border border-gray-200 bg-white text-gray-900"
                            }`}
                        >
                            {item}
                        </li>
                    ))}
                </ul>

                {palette && (
                    <div
                        data-testid="palette"
                        className="rounded border border-gray-300 bg-white p-3 text-sm text-gray-900"
                    >
                        Command palette
                    </div>
                )}
            </div>
        </main>
    );
};
