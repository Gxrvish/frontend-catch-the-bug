import { describe, expect, it } from "vitest";

import type { Notification } from "./notification.types";
import {
    applyFilters,
    countUnread,
    mergeNotificationBatches,
} from "./notificationUtils";

const mergeWithPending = mergeNotificationBatches as unknown as (
    existing: Notification[],
    incoming: Notification[],
    pendingReads: Set<string>
) => Notification[];

function makeNotification(
    id: string,
    isRead: boolean,
    createdAt: number
): Notification {
    return {
        id,
        title: `Alert ${id}`,
        message: `Message ${id}`,
        type: "info",
        category: "system",
        isRead,
        createdAt,
        updatedAt: createdAt,
    };
}

describe("mergeNotificationBatches", () => {
    it("preserves local optimistic read while that id is still in flight", () => {
        const id = "n-1";
        const existing = [makeNotification(id, true, 1000)];
        const incoming = [makeNotification(id, false, 1000)];
        const pendingReads = new Set<string>([id]);

        const merged = mergeWithPending(existing, incoming, pendingReads);

        expect(merged).toHaveLength(1);
        expect(merged[0]?.isRead).toBe(true);
    });

    it("takes the server's other fields for a pending id", () => {
        const id = "n-3";
        const existing = [makeNotification(id, true, 1000)];
        const incoming = [
            { ...makeNotification(id, false, 1000), title: "Alert edited" },
        ];

        const merged = mergeWithPending(
            existing,
            incoming,
            new Set<string>([id])
        );

        // Only the read flag is held back; the rest is still the
        // server's business.
        expect(merged[0]?.isRead).toBe(true);
        expect(merged[0]?.title).toBe("Alert edited");
    });

    it("keeps ordering and still adds new items while one is pending", () => {
        const pending = "n-4";
        const existing = [makeNotification(pending, true, 1000)];
        const incoming = [
            makeNotification(pending, false, 1000),
            makeNotification("n-5", false, 2000),
        ];

        const merged = mergeWithPending(
            existing,
            incoming,
            new Set<string>([pending])
        );

        expect(merged.map((n) => n.id)).toEqual(["n-5", pending]);
        expect(merged[1]?.isRead).toBe(true);
    });

    it("carries the optimistic read into the badge and the filters", () => {
        const id = "n-6";
        const merged = mergeWithPending(
            [makeNotification(id, true, 1000)],
            [makeNotification(id, false, 1000)],
            new Set<string>([id])
        );

        // The unread badge and the unread filter read the same list, so
        // they have to agree with what the row shows.
        expect(countUnread(merged)).toBe(0);
        expect(applyFilters(merged, { readStatus: "unread" })).toHaveLength(0);
        expect(applyFilters(merged, { readStatus: "read" })).toHaveLength(1);
    });

    it("keeps server as authority when the id is not in flight", () => {
        const id = "n-2";
        const existing = [makeNotification(id, true, 1000)];
        const incoming = [makeNotification(id, false, 1000)];
        const pendingReads = new Set<string>();

        const merged = mergeWithPending(existing, incoming, pendingReads);

        expect(merged).toHaveLength(1);
        expect(merged[0]?.isRead).toBe(false);
    });
});
