import { create } from "zustand";

import type { Genre, Title, WatchlistState } from "./watchlist.types";

const NAMES: [string, Genre][] = [
    ["Midnight Protocol", "thriller"],
    ["Orbit Decay", "sci-fi"],
    ["The Last Ledger", "drama"],
    ["Standup Standoff", "comedy"],
    ["Deep Reef", "documentary"],
    ["Neon Harvest", "sci-fi"],
    ["Court of Ash", "drama"],
    ["Bug Bounty", "comedy"],
    ["Signal Lost", "thriller"],
    ["Glacier Mind", "documentary"],
    ["Quantum Debt", "sci-fi"],
    ["The Commit", "drama"],
];

export const seedTitles = (): Title[] =>
    NAMES.map(([name, genre], i) => ({
        id: `t-${i + 1}`,
        name,
        genre,
        trendingRank: i + 1,
        saved: i === 0,
    }));

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
    titles: seedTitles(),
    filter: "",

    setFilter: (filter) => set({ filter }),

    addToList: (id) => {
        // Flip the flag on the title we already have in the store.
        const title = get().titles.find((t) => t.id === id);
        if (title) {
            title.saved = true;
        }
    },

    removeFromList: (id) =>
        set((state) => ({
            titles: state.titles.map((t) =>
                t.id === id ? { ...t, saved: false } : t
            ),
        })),

    refreshTrending: () =>
        set((state) => {
            const ranks = state.titles.map((t) => t.trendingRank);
            for (let i = ranks.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
            }
            return {
                titles: state.titles.map((t, i) => ({
                    ...t,
                    trendingRank: ranks[i],
                })),
            };
        }),
}));
