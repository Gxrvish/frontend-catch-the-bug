import { describe, expect, it } from "vitest";

import type { ActivityItem } from "./activityFeed.types";
import { mergeServerBatch, rollbackLikeState } from "./activityFeedUtils";

const mergeWithPending = mergeServerBatch as unknown as (
    existing: ActivityItem[],
    incoming: ActivityItem[],
    pendingLikes: Map<string, boolean>,
    pendingDismissals: Set<string>
) => ActivityItem[];

const rollbackWithPending = rollbackLikeState as unknown as (
    items: ActivityItem[],
    itemId: string,
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

        const merged = mergeWithPending(
            existing,
            incoming,
            pendingLikes,
            new Set()
        );

        expect(merged[0]?.isLiked).toBe(true);
        expect(merged[0]?.likeCount).toBe(11);
    });

    it("keeps an optimistic unlike while that item is pending", () => {
        const id = "act-1";
        const existing = [makeItem(id, false, 9, 100)];
        const incoming = [makeItem(id, true, 10, 100)];
        // The user just un-liked; the server has not caught up.
        const pendingLikes = new Map<string, boolean>([[id, false]]);

        const merged = mergeWithPending(
            existing,
            incoming,
            pendingLikes,
            new Set()
        );

        expect(merged[0]?.isLiked).toBe(false);
        expect(merged[0]?.likeCount).toBe(9);
    });

    it("takes the server's other fields for a pending item", () => {
        const id = "act-1";
        const existing = [makeItem(id, true, 11, 100)];
        const incoming = {
            ...makeItem(id, false, 10, 100),
            commentCount: 7,
            content: "edited the update",
        };
        const pendingLikes = new Map<string, boolean>([[id, true]]);

        const merged = mergeWithPending(
            existing,
            [incoming],
            pendingLikes,
            new Set()
        );

        // Only the like state is held back — everything else is the
        // server's business, pending mutation or not.
        expect(merged[0]?.isLiked).toBe(true);
        expect(merged[0]?.likeCount).toBe(11);
        expect(merged[0]?.commentCount).toBe(7);
        expect(merged[0]?.content).toBe("edited the update");
    });

    it("keeps the server value for items with no pending like", () => {
        const pending = "act-1";
        const settled = "act-2";
        const existing = [
            makeItem(pending, true, 11, 100),
            makeItem(settled, false, 5, 90),
        ];
        const incoming = [
            makeItem(pending, false, 10, 100),
            makeItem(settled, false, 42, 90),
        ];
        const pendingLikes = new Map<string, boolean>([[pending, true]]);

        const merged = mergeWithPending(
            existing,
            incoming,
            pendingLikes,
            new Set()
        );

        expect(merged[0]?.isLiked).toBe(true);
        expect(merged[0]?.likeCount).toBe(11);
        // Refusing every incoming row is not a fix — untouched items stay
        // server-authoritative.
        expect(merged[1]?.likeCount).toBe(42);
    });

    it("does not resurrect an item dismissed while the poll was in flight", () => {
        const id = "act-9";
        const incoming = [makeItem(id, false, 3, 100)];
        const pendingDismissals = new Set<string>([id]);

        const merged = mergeWithPending(
            [],
            incoming,
            new Map(),
            pendingDismissals
        );

        expect(merged.find((item) => item.id === id)).toBeUndefined();
    });

    it("still adds new items newest-first while a like is pending", () => {
        const pending = "act-1";
        const fresh = "act-2";
        const existing = [makeItem(pending, true, 11, 100)];
        const incoming = [
            makeItem(pending, false, 10, 100),
            makeItem(fresh, false, 3, 200),
        ];
        const pendingLikes = new Map<string, boolean>([[pending, true]]);

        const merged = mergeWithPending(
            existing,
            incoming,
            pendingLikes,
            new Set()
        );

        expect(merged.map((item) => item.id)).toEqual([fresh, pending]);
        expect(merged[1]?.isLiked).toBe(true);
    });

    it("does not flip to liked when rollback runs on already-stale unliked state", () => {
        const id = "act-2";
        const staleItems = [makeItem(id, false, 10, 101)];
        const pendingLikes = new Map<string, boolean>([[id, true]]);

        const rolledBack = rollbackWithPending(staleItems, id, pendingLikes);

        expect(rolledBack[0]?.isLiked).toBe(false);
        expect(rolledBack[0]?.likeCount).toBe(10);
    });

    it("undoes a failed like that the UI is still showing", () => {
        const id = "act-3";
        const other = "act-4";
        const items = [
            makeItem(id, true, 11, 101),
            makeItem(other, true, 4, 100),
        ];
        const pendingLikes = new Map<string, boolean>([[id, true]]);

        const rolledBack = rollbackWithPending(items, id, pendingLikes);

        // Doing nothing is not a fix — a failed like has to come back off.
        expect(rolledBack[0]?.isLiked).toBe(false);
        expect(rolledBack[0]?.likeCount).toBe(10);
        // Neighbours are not part of this mutation.
        expect(rolledBack[1]).toEqual(items[1]);
    });

    it("undoes a failed unlike that the UI is still showing", () => {
        const id = "act-5";
        const items = [makeItem(id, false, 9, 101)];
        const pendingLikes = new Map<string, boolean>([[id, false]]);

        const rolledBack = rollbackWithPending(items, id, pendingLikes);

        expect(rolledBack[0]?.isLiked).toBe(true);
        expect(rolledBack[0]?.likeCount).toBe(10);
    });
});
