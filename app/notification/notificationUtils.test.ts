import { describe, expect, it } from "vitest";

import type { Notification } from "./notification.types";
import { mergeNotificationBatches } from "./notificationUtils";

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
