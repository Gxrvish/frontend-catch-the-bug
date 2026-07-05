"use client";

import { useState } from "react";

import { PreviewModal } from "./PreviewModal";
import type { Video } from "./trailerModal.types";

interface VideoCardProps {
    video: Video;
    onCardActivate: (video: Video) => void;
    onAddToQueue: (video: Video) => void;
}

export const VideoCard = ({
    video,
    onCardActivate,
    onAddToQueue,
}: VideoCardProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <div
            onClick={() => {
                onCardActivate(video);
                setPreviewOpen(true);
            }}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300"
        >
            <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gray-900 text-2xl">
                ▶️
            </div>
            <h4 className="mb-1 text-sm font-semibold text-gray-900">
                {video.title}
            </h4>
            <p className="text-xs text-gray-500">
                {video.channel} · {video.views} views · {video.duration}
            </p>

            {previewOpen && (
                <PreviewModal
                    video={video}
                    onClose={() => setPreviewOpen(false)}
                    onAddToQueue={onAddToQueue}
                />
            )}
        </div>
    );
};
