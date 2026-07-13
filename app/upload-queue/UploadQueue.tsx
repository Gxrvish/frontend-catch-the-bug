"use client";

import { useRef, useState } from "react";

import { _complete, getInFlight } from "./uploadApi";
import type { QueueHandle, UploadStatus } from "./uploadQueue";
import { startQueue } from "./uploadQueue";

const FILES = ["a.png", "b.png", "c.png", "d.png", "e.png"];

export const UploadQueue = () => {
    const [statuses, setStatuses] = useState<Record<string, UploadStatus>>(() =>
        Object.fromEntries(FILES.map((file) => [file, "queued"]))
    );
    const queueRef = useRef<QueueHandle | null>(null);

    const start = () => {
        queueRef.current = startQueue(FILES, setStatuses);
        queueRef.current.done.catch(() => undefined);
    };

    // Easy Repro: answer whatever the transport currently has open.
    const deliver = () => {
        getInFlight().forEach((name) => _complete(name));
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Upload Queue
                </h2>

                <div className="flex gap-2">
                    <button
                        onClick={start}
                        className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                    >
                        Start upload
                    </button>
                    <button
                        onClick={deliver}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-900"
                    >
                        Answer open requests
                    </button>
                </div>

                <p className="text-xs text-gray-700">
                    Open requests:{" "}
                    <span data-testid="in-flight">{getInFlight().length}</span>
                </p>

                <ul className="space-y-1">
                    {FILES.map((file) => (
                        <li
                            key={file}
                            data-testid="row"
                            className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
                        >
                            <span>{file}</span>
                            <span className="flex items-center gap-2">
                                <span data-testid={`status-${file}`}>
                                    {statuses[file]}
                                </span>
                                <button
                                    onClick={() =>
                                        queueRef.current?.cancel(file)
                                    }
                                    className="rounded border border-gray-300 px-2 text-xs"
                                >
                                    Cancel
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
