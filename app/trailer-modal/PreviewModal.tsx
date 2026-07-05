"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import type { Video } from "./trailerModal.types";

interface PreviewModalProps {
    video: Video;
    onClose: () => void;
    onAddToQueue: (video: Video) => void;
}

export const PreviewModal = ({
    video,
    onClose,
    onAddToQueue,
}: PreviewModalProps) => {
    const [muted, setMuted] = useState(true);

    return createPortal(
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
        >
            <div
                role="dialog"
                aria-label={video.title}
                className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            >
                <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                        {video.title}
                    </h3>
                    <button
                        onClick={onClose}
                        aria-label="close preview"
                        className="rounded px-2 text-gray-400 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-gray-900 text-4xl">
                    ▶️
                </div>

                <p className="mb-4 text-xs text-gray-500">
                    {video.channel} · {video.views} views · {video.duration}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => setMuted((m) => !m)}
                        className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                        {muted ? "🔇 Muted" : "🔊 Sound on"}
                    </button>
                    <button
                        onClick={() => onAddToQueue(video)}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                    >
                        + Add to Queue
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
