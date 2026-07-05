export interface Suggestion {
    id: string;
    text: string;
    category: SuggestionCategory;
    trendingScore: number;
}

export type SuggestionCategory = "product" | "brand" | "query" | "help";

export interface SuggestionResponse {
    /** The query string this response was computed for. */
    forQuery: string;
    suggestions: Suggestion[];
    /** Server-side latency in ms, exposed for the debug panel. */
    servedInMs: number;
}

export type SearchSimulationMode = "random" | "repro";

export interface UseSearchSuggestionsOptions {
    simulationMode?: SearchSimulationMode;
}

export interface RequestLogEntry {
    id: number;
    query: string;
    latencyMs: number;
    status: "in-flight" | "landed";
    startedAt: number;
}
