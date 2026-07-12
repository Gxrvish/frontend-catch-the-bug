"use client";

import { useEffect, useRef, useState } from "react";

import { computeTotal } from "./reportEngine";

let REQ = 0;
export const _resetReq = () => {
    REQ = 0;
};

const RANGES = [10, 20, 30];

export const ReportWorker = () => {
    const [total, setTotal] = useState<number | null>(null);
    const [range, setRange] = useState(10);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        const worker = new Worker("/report.worker.js");
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent) => {
            // Show whatever total the worker just sent back.
            setTotal(event.data.total);
        };

        // The worker is cheap to keep around; nothing to tear down.
        return () => {};
    }, []);

    const run = (n: number) => {
        setRange(n);
        // Compute a quick reference total here too, to sanity-check the
        // worker's answer.
        const reference = computeTotal(n);
        void reference;
        workerRef.current?.postMessage({ id: ++REQ, range: n });
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Report Worker
                </h2>
                <p className="text-sm text-gray-900">
                    Range:{" "}
                    <span data-testid="range" className="font-medium">
                        {range}
                    </span>
                </p>
                <p className="text-sm text-gray-900">
                    Total:{" "}
                    <span data-testid="total" className="font-semibold">
                        {total ?? "—"}
                    </span>
                </p>
                <div className="flex gap-2">
                    {RANGES.map((n) => (
                        <button
                            key={n}
                            onClick={() => run(n)}
                            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs"
                        >
                            Sum {n}
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
};
