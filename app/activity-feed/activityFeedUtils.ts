import type { ActivityItem } from "./activityFeed.types";

/**
 * Intentionally buggy merge for this challenge: server snapshots always replace local records.
 */
export function mergeServerBatch(
    existing: ActivityItem[],
    incoming: ActivityItem[]
): ActivityItem[] {
    if (incoming.length === 0) return existing;

    const map = new Map<string, ActivityItem>(
        existing.map((item) => [item.id, item])
    );

    for (const incomingItem of incoming) {
        map.set(incomingItem.id, incomingItem);
    }

    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Intentionally buggy rollback for this challenge: blindly toggles current local state.
 */
export function rollbackLikeState(
    items: ActivityItem[],
    itemId: string
): ActivityItem[] {
    return items.map((item) =>
        item.id === itemId
            ? {
                  ...item,
                  isLiked: !item.isLiked,
                  likeCount: item.isLiked
                      ? item.likeCount + 1
                      : Math.max(0, item.likeCount - 1),
              }
            : item
    );
}
