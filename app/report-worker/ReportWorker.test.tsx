// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _resetReportEngine, getMainThreadRuns } from "./reportEngine";
import { _resetReq, ReportWorker } from "./ReportWorker";

type WorkerMessage = { id: number; range: number };
type WorkerReply = { id: number; range: number; total: number };

class FakeWorker {
    static instances: FakeWorker[] = [];

    posted: WorkerMessage[] = [];
    terminated = false;
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(_url: string | URL) {
        FakeWorker.instances.push(this);
    }

    postMessage(data: WorkerMessage) {
        this.posted.push(data);
    }

    terminate() {
        this.terminated = true;
    }

    // test driver
    reply(data: WorkerReply) {
        this.onmessage?.({ data } as MessageEvent);
    }
}

describe("ReportWorker", () => {
    beforeEach(() => {
        _resetReportEngine();
        _resetReq();
        FakeWorker.instances = [];
        vi.stubGlobal("Worker", FakeWorker);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows the answer to the latest request, not a late stale one", () => {
        render(<ReportWorker />);
        const worker = FakeWorker.instances[0];

        fireEvent.click(screen.getByRole("button", { name: "Sum 10" }));
        fireEvent.click(screen.getByRole("button", { name: "Sum 30" }));

        const [first, second] = worker.posted;
        // The fast (latest) request answers first, the slow stale one late.
        act(() => worker.reply({ id: second.id, range: 30, total: 300 }));
        act(() => worker.reply({ id: first.id, range: 10, total: 100 }));

        expect(screen.getByTestId("total")).toHaveTextContent("300");
    });

    it("terminates the worker on unmount", () => {
        const { unmount } = render(<ReportWorker />);
        const worker = FakeWorker.instances[0];

        unmount();

        expect(worker.terminated).toBe(true);
    });

    it("does the aggregation off the main thread", () => {
        render(<ReportWorker />);

        fireEvent.click(screen.getByRole("button", { name: "Sum 20" }));

        expect(getMainThreadRuns()).toBe(0);
    });

    it("renders the worker's total for a request", () => {
        render(<ReportWorker />);
        const worker = FakeWorker.instances[0];

        fireEvent.click(screen.getByRole("button", { name: "Sum 10" }));
        act(() =>
            worker.reply({ id: worker.posted[0].id, range: 10, total: 55 })
        );

        expect(screen.getByTestId("total")).toHaveTextContent("55");
    });
});
