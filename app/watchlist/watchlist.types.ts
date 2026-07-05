export interface Title {
    id: string;
    name: string;
    genre: Genre;
    /** Lower is hotter. Reshuffled by "Refresh Trending". */
    trendingRank: number;
    saved: boolean;
}

export type Genre = "drama" | "sci-fi" | "comedy" | "thriller" | "documentary";

export interface WatchlistState {
    titles: Title[];
    filter: string;
    setFilter: (filter: string) => void;
    addToList: (id: string) => void;
    removeFromList: (id: string) => void;
    refreshTrending: () => void;
}
