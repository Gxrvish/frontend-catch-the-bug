import type {
    SearchSimulationMode,
    Suggestion,
    SuggestionResponse,
} from "./search.types";

const CATALOG: Omit<Suggestion, "id">[] = [
    { text: "iphone 16 pro max", category: "product", trendingScore: 98 },
    { text: "iphone 16 case", category: "product", trendingScore: 91 },
    { text: "iphone charger 20w", category: "product", trendingScore: 87 },
    { text: "iphone screen protector", category: "product", trendingScore: 82 },
    { text: "ipad air m3", category: "product", trendingScore: 76 },
    { text: "ipad mini", category: "product", trendingScore: 64 },
    { text: "ip camera outdoor", category: "product", trendingScore: 58 },
    { text: "ip rating explained", category: "help", trendingScore: 33 },
    { text: "instant pot duo", category: "product", trendingScore: 71 },
    { text: "insignia tv 55 inch", category: "product", trendingScore: 44 },
    { text: "ink cartridges hp", category: "product", trendingScore: 52 },
    { text: "iron board", category: "product", trendingScore: 29 },
    { text: "macbook air m4", category: "product", trendingScore: 95 },
    { text: "macbook pro 14", category: "product", trendingScore: 90 },
    { text: "mac mini m4", category: "product", trendingScore: 79 },
    { text: "magsafe wallet", category: "product", trendingScore: 61 },
    { text: "monitor 27 inch 144hz", category: "product", trendingScore: 73 },
    {
        text: "mouse wireless ergonomic",
        category: "product",
        trendingScore: 55,
    },
    { text: "samsung galaxy s25", category: "product", trendingScore: 93 },
    { text: "samsung tv 65 inch", category: "product", trendingScore: 68 },
    { text: "soundbar dolby atmos", category: "product", trendingScore: 62 },
    { text: "ssd 2tb nvme", category: "product", trendingScore: 77 },
];

const MAX_RESULTS = 8;
const REPRO_BASE_LATENCY_MS = 1200;
const REPRO_PER_CHAR_DISCOUNT_MS = 175;
const REPRO_MIN_LATENCY_MS = 150;

const randomBetween = (min: number, max: number): number =>
    min + Math.random() * (max - min);

const delay = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        const id = setTimeout(resolve, ms);
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(id);
                reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true }
        );
    });

/**
 * Real autocomplete backends answer short prefixes from colder, larger
 * candidate sets, so short queries are routinely SLOWER than long ones.
 * Repro mode makes that inversion deterministic.
 */
export function suggestionLatencyMs(
    query: string,
    mode: SearchSimulationMode
): number {
    if (mode === "repro") {
        return Math.max(
            REPRO_MIN_LATENCY_MS,
            REPRO_BASE_LATENCY_MS - query.length * REPRO_PER_CHAR_DISCOUNT_MS
        );
    }
    return randomBetween(100, 1300);
}

export async function fetchSuggestions(
    query: string,
    mode: SearchSimulationMode = "random",
    signal?: AbortSignal
): Promise<SuggestionResponse> {
    const latency = suggestionLatencyMs(query, mode);
    await delay(latency, signal);

    const q = query.trim().toLowerCase();
    const suggestions: Suggestion[] = CATALOG.filter((entry) =>
        entry.text.startsWith(q)
    )
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, MAX_RESULTS)
        .map((entry, i) => ({ ...entry, id: `${q}-${i}` }));

    return { forQuery: query, suggestions, servedInMs: Math.round(latency) };
}
