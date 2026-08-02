import { beforeEach, describe, expect, it } from "vitest";

import {
    _complete,
    _fail,
    _resetUploadApi,
    getAborted,
    getInFlight,
    getMaxInFlight,
} from "./uploadApi";
import { startQueue } from "./uploadQueue";

const FILES = ["a.png", "b.png", "c.png", "d.png", "e.png"];

/**
 * Settles whatever the queue has put on the wire, over and over, so a queue
 * that only runs two uploads at a time still gets to finish.
 */
const drive = async (failing: string[] = []) => {
    for (let step = 0; step < 12; step++) {
        getInFlight().forEach((name) => {
            if (failing.includes(name)) {
                _fail(name);
            } else {
                _complete(name);
            }
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
};

describe("uploadQueue", () => {
    beforeEach(() => {
        _resetUploadApi();
    });

    it("never runs more than two uploads at once", async () => {
        const queue = startQueue(FILES);

        expect(getMaxInFlight()).toBeLessThanOrEqual(2);

        await drive();
        await queue.done.catch(() => undefined);
    });

    it("aborts the request when an upload is cancelled", async () => {
        const queue = startQueue(FILES);

        queue.cancel("b.png");

        expect(getAborted()).toContain("b.png");

        await drive();
        await queue.done.catch(() => undefined);
        // A cancelled upload must not come back to life when the transport
        // answers late.
        expect(queue.status("b.png")).toBe("cancelled");
    });

    it("keeps going when one upload fails", async () => {
        const queue = startQueue(FILES);
        const settled = queue.done.then(
            () => "resolved",
            () => "rejected"
        );

        await drive(["c.png"]);

        expect(await settled).toBe("resolved");
        expect(queue.status("c.png")).toBe("failed");
        expect(
            FILES.filter((file) => queue.status(file) === "done")
        ).toHaveLength(4);
    });

    it("does not upload a file cancelled while it was still queued", async () => {
        const queue = startQueue(FILES);

        // With a pool of two, "e.png" has not been handed to the
        // transport yet.
        queue.cancel("e.png");

        await drive();
        await queue.done.catch(() => undefined);

        expect(queue.status("e.png")).toBe("cancelled");
        expect(
            FILES.filter((file) => queue.status(file) === "done")
        ).toHaveLength(4);
    });

    it("finishes when one file is cancelled and another fails", async () => {
        const queue = startQueue(FILES);
        const settled = queue.done.then(
            () => "resolved",
            () => "rejected"
        );

        queue.cancel("b.png");
        await drive(["d.png"]);

        expect(await settled).toBe("resolved");
        expect(queue.status("b.png")).toBe("cancelled");
        expect(queue.status("d.png")).toBe("failed");
        expect(
            FILES.filter((file) => queue.status(file) === "done")
        ).toHaveLength(3);
    });

    it("resolves even if every upload fails", async () => {
        const queue = startQueue(FILES);
        const settled = queue.done.then(
            () => "resolved",
            () => "rejected"
        );

        await drive(FILES);

        // A queue that rejects on the first failure never reports the
        // rest.
        expect(await settled).toBe("resolved");
        expect(Object.values(queue.statuses())).toEqual([
            "failed",
            "failed",
            "failed",
            "failed",
            "failed",
        ]);
    });

    it("uploads every file on the happy path", async () => {
        const queue = startQueue(FILES);

        await drive();
        await queue.done;

        expect(Object.values(queue.statuses())).toEqual([
            "done",
            "done",
            "done",
            "done",
            "done",
        ]);
    });
});
