import type {
    Notification,
    NotificationCategory,
    NotificationType,
} from "./notification.types";

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
    const latency = 1000 + Math.random() * 3500;
    await delay(latency, signal);

    const results: Notification[] = [];

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
    await delay(600 + Math.random() * 800, signal);
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
    await delay(900 + Math.random() * 600, signal);
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
    await delay(300 + Math.random() * 300, signal);
    serverStore.delete(id);
    const idx = recentIds.indexOf(id);
    if (idx !== -1) recentIds.splice(idx, 1);
}
