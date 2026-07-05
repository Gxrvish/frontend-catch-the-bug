"use client";

import { useRef } from "react";

import { useWatchlistStore } from "./watchlistStore";

interface MyListPanelProps {
    /** Render probe used by tests and the on-screen badge. */
    onRender?: () => void;
}

export const MyListPanel = ({ onRender }: MyListPanelProps) => {
    // Grab everything we might need from the store.
    const { titles, removeFromList } = useWatchlistStore();

    const renderCount = useRef(0);
    // eslint-disable-next-line react-hooks/refs -- intentional render probe for this exercise
    const renders = ++renderCount.current;
    onRender?.();

    const saved = titles.filter((t) => t.saved);

    return (
        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                    My List ({saved.length})
                </h3>
                <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-xs text-purple-700">
                    renders: {renders}
                </span>
            </div>
            {saved.length === 0 && (
                <p className="text-xs text-gray-500">Nothing saved yet.</p>
            )}
            <ul className="space-y-2">
                {saved.map((t) => (
                    <li
                        key={t.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800"
                    >
                        <span>{t.name}</span>
                        <button
                            onClick={() => removeFromList(t.id)}
                            className="text-xs text-red-500 hover:underline"
                        >
                            remove
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};
