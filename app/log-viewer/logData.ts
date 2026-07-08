import type { LogEntry, LogLevel } from "./logViewer.types";

export const TOTAL_ENTRIES = 10_000;

const LEVELS: LogLevel[] = ["info", "info", "info", "warn", "error"];

const MESSAGES = [
    "Deploy pipeline finished",
    "Cache warmed for eu-west-1",
    "Request rate above baseline",
    "Retrying webhook delivery",
    "Connection pool saturated",
];

// Deterministic dataset: entry N is always the same, so repro steps and
// tests can point at exact rows.
export const seedLogs = (): LogEntry[] =>
    Array.from({ length: TOTAL_ENTRIES }, (_, i) => ({
        id: `log-${i + 1}`,
        index: i + 1,
        level: LEVELS[i % LEVELS.length],
        message: `#${i + 1} ${MESSAGES[i % MESSAGES.length]}`,
    }));
