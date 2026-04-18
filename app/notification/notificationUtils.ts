import type { RefObject } from "react";

import type { Notification, NotificationFilters } from "./notification.types";

/**
 * Merges a batch of incoming (server-authoritative) notifications into the
 * existing local list. Incoming records always replace existing ones by ID
 * to keep the client in sync with the server.
 */
export function mergeNotificationBatches(
    existing: Notification[],
    incoming: Notification[],
    pendingReads: RefObject<Set<string>>
): Notification[] {
    if (incoming.length === 0) return existing;
    const existingMap = new Map(existing.map((item) => [item.id, item]));
    const map = new Map<string, Notification>(existing.map((n) => [n.id, n]));

    for (const incomingItem of incoming) {
        const incomingId = incomingItem.id;
        const isInFlight = pendingReads.current.has(incomingId);
        const shouldKeepLocalRead = isInFlight && !incomingItem.isRead;
        const existingItem = existingMap.get(incomingId);
        map.set(
            incomingId,
            shouldKeepLocalRead ? (existingItem ?? incomingItem) : incomingItem
        );
    }

    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function applyFilters(
    items: Notification[],
    filters: NotificationFilters
): Notification[] {
    return items.filter((item) => {
        if (
            filters.type &&
            filters.type !== "all" &&
            item.type !== filters.type
        )
            return false;
        if (filters.readStatus === "read" && !item.isRead) return false;
        if (filters.readStatus === "unread" && item.isRead) return false;
        return true;
    });
}

export function countUnread(items: Notification[]): number {
    return items.reduce((sum, n) => sum + (n.isRead ? 0 : 1), 0);
}
