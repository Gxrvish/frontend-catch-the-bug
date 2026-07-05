import { useEffect, useRef, useState } from "react";

import type {
    RequestLogEntry,
    Suggestion,
    UseSearchSuggestionsOptions,
} from "./search.types";
import { fetchSuggestions } from "./searchApi";

interface UseSearchSuggestionsReturn {
    suggestions: Suggestion[];
    /** Which query the currently displayed suggestions were computed for. */
    resultsForQuery: string;
    isLoading: boolean;
    requestLog: RequestLogEntry[];
}

export function useSearchSuggestions(
    query: string,
    options: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsReturn {
    const { simulationMode = "repro" } = options;

    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [resultsForQuery, setResultsForQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [requestLog, setRequestLog] = useState<RequestLogEntry[]>([]);

    const requestSeq = useRef(0);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed === "") {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting for an empty query is fine here
            setSuggestions([]);
            setResultsForQuery("");
            setIsLoading(false);
            return;
        }

        const requestId = ++requestSeq.current;
        setIsLoading(true);

        fetchSuggestions(trimmed, simulationMode).then((response) => {
            setSuggestions(response.suggestions);
            setResultsForQuery(response.forQuery);
            setIsLoading(false);

            setRequestLog((prev) =>
                prev.map((entry) =>
                    entry.id === requestId
                        ? { ...entry, status: "landed" }
                        : entry
                )
            );
        });

        setRequestLog((prev) =>
            [
                ...prev,
                {
                    id: requestId,
                    query: trimmed,
                    latencyMs: 0,
                    status: "in-flight" as const,
                    startedAt: Date.now(),
                },
            ].slice(-8)
        );
    }, [query, simulationMode]);

    return { suggestions, resultsForQuery, isLoading, requestLog };
}
