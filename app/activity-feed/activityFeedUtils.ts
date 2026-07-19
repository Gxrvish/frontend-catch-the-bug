import type { ActivityItem } from "./activityFeed.types";

/**
 * Intentionally buggy merge for this challenge: server snapshots always replace local records.
 */
export function mergeServerBatch(
    existing: ActivityItem[],
    incoming: ActivityItem[],
    pendingLikes: Map<string, boolean>,
    pendingDismissals: Set<string>
): ActivityItem[] {
    if (incoming.length === 0) return existing;

    const map = new Map<string, ActivityItem>(
        existing.map((item) => [item.id, item])
    );

    for (const incomingItem of incoming) {
        if (pendingDismissals.has(incomingItem.id)) continue;

        if (pendingLikes.has(incomingItem.id)) {
            const isLiked = pendingLikes.get(incomingItem.id) ?? false;
            const likeCount = isLiked
                ? incomingItem.likeCount + 1
                : Math.max(0, incomingItem.likeCount - 1);
            map.set(incomingItem.id, { ...incomingItem, isLiked, likeCount });
            continue;
        }
        map.set(incomingItem.id, incomingItem);
    }

    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Intentionally buggy rollback for this challenge: blindly toggles current local state.
 */
export function rollbackLikeState(
    items: ActivityItem[],
    itemId: string,
    pendingLikes: Map<string, boolean>
): ActivityItem[] {
    return items.map((item) =>
        item.id === itemId
            ? {
                  ...item,
                  isLiked: pendingLikes.has(itemId)
                      ? !item.isLiked
                      : item.isLiked,
                  likeCount: pendingLikes.has(itemId)
                      ? item.isLiked
                          ? Math.max(0, item.likeCount - 1)
                          : item.likeCount + 1
                      : item.likeCount,
              }
            : item
    );
}
