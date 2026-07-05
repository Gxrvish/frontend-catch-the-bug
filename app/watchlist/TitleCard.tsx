"use client";

import { useRef } from "react";

import type { Title } from "./watchlist.types";
import { useWatchlistStore } from "./watchlistStore";

interface TitleCardProps {
    title: Title;
}

export const TitleCard = ({ title }: TitleCardProps) => {
    const { addToList, removeFromList } = useWatchlistStore();

    const renderCount = useRef(0);
    // eslint-disable-next-line react-hooks/refs -- intentional render probe for this exercise
    const renders = ++renderCount.current;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                    {title.name}
                </h4>
                <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] text-purple-700">
                    r:{renders}
                </span>
            </div>
            <p className="mb-3 text-xs text-gray-500">
                {title.genre} · trending #{title.trendingRank}
            </p>
            {title.saved ? (
                <button
                    onClick={() => removeFromList(title.id)}
                    className="w-full rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700"
                >
                    ✓ In My List
                </button>
            ) : (
                <button
                    onClick={() => addToList(title.id)}
                    className="w-full rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                    + Add to My List
                </button>
            )}
        </div>
    );
};
