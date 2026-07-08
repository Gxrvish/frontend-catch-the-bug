export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
    id: string;
    index: number;
    level: LogLevel;
    message: string;
}
