"use client";

import { MyListPanel } from "./MyListPanel";
import { TitleCard } from "./TitleCard";
import { useWatchlistStore } from "./watchlistStore";

export const Watchlist = () => {
    const { titles, filter, setFilter, refreshTrending } = useWatchlistStore();

    const visible = titles
        .filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => a.trendingRank - b.trendingRank);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Watchlist
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Browse titles, add them to My List, and keep an eye on the
                    render badges.
                </p>

                <div className="mb-4 flex gap-3">
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter titles..."
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={refreshTrending}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Refresh Trending
                    </button>
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        {visible.map((t) => (
                            <TitleCard key={t.id} title={t} />
                        ))}
                    </div>
                    <MyListPanel />
                </div>
            </div>
        </main>
    );
};
