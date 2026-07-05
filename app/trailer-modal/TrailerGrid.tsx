"use client";

import { useState } from "react";

import { VIDEOS } from "./trailerData";
import type { Video } from "./trailerModal.types";
import { VideoCard } from "./VideoCard";

export const TrailerGrid = () => {
    const [queue, setQueue] = useState<Video[]>([]);
    const [cardActivations, setCardActivations] = useState(0);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="mb-1 text-xl font-semibold text-gray-900">
                            Trailer Previews
                        </h2>
                        <p className="text-sm text-gray-600">
                            Click a card to open the preview. Watch the
                            analytics counter.
                        </p>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        <p>
                            Queue:{" "}
                            <span
                                data-testid="queue-count"
                                className="font-semibold"
                            >
                                {queue.length}
                            </span>
                        </p>
                        <p>
                            Analytics — card clicks:{" "}
                            <span
                                data-testid="card-click-count"
                                className="font-semibold"
                            >
                                {cardActivations}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {VIDEOS.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onCardActivate={() =>
                                setCardActivations((count) => count + 1)
                            }
                            onAddToQueue={(v) =>
                                setQueue((prev) => [...prev, v])
                            }
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};
