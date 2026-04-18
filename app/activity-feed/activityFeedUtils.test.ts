import { describe, expect, it } from "vitest";

import type { ActivityItem } from "./activityFeed.types";
import { mergeServerBatch, rollbackLikeState } from "./activityFeedUtils";

const mergeWithPending = mergeServerBatch as unknown as (
    existing: ActivityItem[],
    incoming: ActivityItem[],
    pendingLikes: Map<string, boolean>
) => ActivityItem[];

const makeItem = (
    id: string,
    isLiked: boolean,
    likeCount: number,
    createdAt = 1
): ActivityItem => ({
    id,
    actor: { id: "u1", name: "Alice", avatarUrl: "/avatars/alice.jpg" },
    type: "post",
    content: "posted an update",
    isLiked,
    likeCount,
    commentCount: 0,
    createdAt,
    updatedAt: createdAt,
});

describe("activityFeed utils regression", () => {
    it("keeps optimistic like while that item is pending", () => {
        const id = "act-1";
        const existing = [makeItem(id, true, 11, 100)];
        const incoming = [makeItem(id, false, 10, 100)];
        const pendingLikes = new Map<string, boolean>([[id, true]]);

        const merged = mergeWithPending(existing, incoming, pendingLikes);

        expect(merged[0]?.isLiked).toBe(true);
        expect(merged[0]?.likeCount).toBe(11);
    });

    it("does not flip to liked when rollback runs on already-stale unliked state", () => {
        const id = "act-2";
        const staleItems = [makeItem(id, false, 10, 101)];

        const rolledBack = rollbackLikeState(staleItems, id);

        expect(rolledBack[0]?.isLiked).toBe(false);
        expect(rolledBack[0]?.likeCount).toBe(10);
    });
});
