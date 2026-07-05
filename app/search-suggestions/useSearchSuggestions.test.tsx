// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSearchSuggestions } from "./useSearchSuggestions";

describe("useSearchSuggestions", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows suggestions for the latest query even when an older request resolves last", async () => {
        // Repro mode latencies: "ip" answers in 850ms, "iphone" in 150ms.
        const { result, rerender } = renderHook(
            ({ query }) =>
                useSearchSuggestions(query, { simulationMode: "repro" }),
            { initialProps: { query: "ip" } }
        );

        // User keeps typing before the first request lands.
        rerender({ query: "iphone" });

        // The newer, faster request for "iphone" lands first.
        await act(async () => {
            await vi.advanceTimersByTimeAsync(200);
        });
        expect(result.current.resultsForQuery).toBe("iphone");

        // Now the older, slower request for "ip" finally lands.
        await act(async () => {
            await vi.advanceTimersByTimeAsync(800);
        });

        // The dropdown must still answer the query the user actually typed.
        expect(result.current.resultsForQuery).toBe("iphone");
        expect(
            result.current.suggestions.every((s) => s.text.startsWith("iphone"))
        ).toBe(true);
    });

    it("does not report loading once the latest request has resolved", async () => {
        const { result, rerender } = renderHook(
            ({ query }) =>
                useSearchSuggestions(query, { simulationMode: "repro" }),
            { initialProps: { query: "ip" } }
        );

        rerender({ query: "iphone" });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(result.current.isLoading).toBe(false);
    });
});
