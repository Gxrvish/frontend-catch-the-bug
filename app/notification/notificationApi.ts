import type {
    Notification,
    NotificationCategory,
    NotificationType,
} from "./notification.types";

export type NotificationSimulationMode = "random" | "repro";

const REPRO_FETCH_LATENCY_MS = 250;
const REPRO_MARK_AS_READ_LATENCY_MS = 4200;
const REPRO_MARK_ALL_AS_READ_LATENCY_MS = 4200;
const REPRO_DISMISS_LATENCY_MS = 250;

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

interface ServerNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    isRead: boolean;
    createdAt: number;
    updatedAt: number;
}

const serverStore = new Map<string, ServerNotification>();
const recentIds: string[] = [];
let idSeq = 0;
let simulationMode: NotificationSimulationMode = "random";

const randomBetween = (min: number, max: number): number =>
    min + Math.random() * (max - min);

export function setNotificationSimulationMode(
    mode: NotificationSimulationMode
): void {
    simulationMode = mode;
}

export function resetNotificationSimulation(seedCount = 0): void {
    serverStore.clear();
    recentIds.splice(0, recentIds.length);
    idSeq = 0;

    for (let i = 0; i < seedCount; i += 1) {
        createServerNotification();
    }
}

function createServerNotification(): ServerNotification {
    const id = `n-${++idSeq}`;
    const now = Date.now();
    const notif: ServerNotification = {
        id,
        title: `Alert ${idSeq}`,
        message: `Notification payload for ${id}`,
        type: (["info", "warning", "error", "success"] as const)[
            Math.floor(Math.random() * 4)
        ],
        category: (["system", "social", "promotional", "transaction"] as const)[
            Math.floor(Math.random() * 4)
        ],
        isRead: false,
        createdAt: now,
        updatedAt: now,
    };
    serverStore.set(id, notif);
    recentIds.push(id);
    if (recentIds.length > 15) recentIds.shift();
    return notif;
}

export async function fetchNotifications(
    signal?: AbortSignal
): Promise<Notification[]> {
    const latency =
        simulationMode === "repro"
            ? REPRO_FETCH_LATENCY_MS
            : randomBetween(1000, 4500);
    await delay(latency, signal);

    const results: Notification[] = [];

    if (simulationMode === "repro") {
        if (recentIds.length === 0) {
            createServerNotification();
        }

        const replayIds = recentIds.slice(-6).reverse();
        for (const id of replayIds) {
            const stored = serverStore.get(id);
            if (stored) {
                results.push({ ...stored });
            }
        }

        return results;
    }

    if (Math.random() > 0.45) {
        results.push({ ...createServerNotification() });
    }

    if (recentIds.length > 0 && Math.random() > 0.5) {
        const pick = recentIds[Math.floor(Math.random() * recentIds.length)];
        const stored = serverStore.get(pick);
        if (stored) {
            results.push({ ...stored });
        }
    }

    return results;
}

export async function markAsReadApi(
    id: string,
    signal?: AbortSignal
): Promise<void> {
    await delay(
        simulationMode === "repro"
            ? REPRO_MARK_AS_READ_LATENCY_MS
            : randomBetween(600, 1400),
        signal
    );
    const entry = serverStore.get(id);
    if (entry) {
        entry.isRead = true;
        entry.updatedAt = Date.now();
    }
}

export async function markAllAsReadApi(
    ids: string[],
    signal?: AbortSignal
): Promise<void> {
    await delay(
        simulationMode === "repro"
            ? REPRO_MARK_ALL_AS_READ_LATENCY_MS
            : randomBetween(900, 1500),
        signal
    );
    ids.forEach((id) => {
        const entry = serverStore.get(id);
        if (entry) {
            entry.isRead = true;
            entry.updatedAt = Date.now();
        }
    });
}

export async function dismissApi(
    id: string,
    signal?: AbortSignal
): Promise<void> {
    await delay(
        simulationMode === "repro"
            ? REPRO_DISMISS_LATENCY_MS
            : randomBetween(300, 600),
        signal
    );
    serverStore.delete(id);
    const idx = recentIds.indexOf(id);
    if (idx !== -1) recentIds.splice(idx, 1);
}
