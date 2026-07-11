import { useState } from "react";

import type { Track } from "./playlistEditor.types";

const formatDuration = (sec: number) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

export const TrackRow = ({
    track,
    onRemove,
}: {
    track: Track;
    onRemove: () => void;
}) => {
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState("");

    return (
        <li
            data-testid="track-row"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
        >
            <div className="min-w-0 flex-1">
                <p
                    data-testid="track-title"
                    className="truncate text-sm font-semibold text-gray-900"
                >
                    {track.title}
                </p>
                <p className="text-xs text-gray-500">
                    {track.artist} · {formatDuration(track.durationSec)}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        aria-label={`rate ${track.title} ${star} stars`}
                        onClick={() => setRating(star)}
                        className={`text-sm ${
                            star <= rating ? "text-amber-400" : "text-gray-300"
                        }`}
                    >
                        ★
                    </button>
                ))}
            </div>
            <input
                aria-label={`note for ${track.title}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note"
                className="w-36 shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-xs"
            />
            <button
                aria-label={`remove ${track.title}`}
                onClick={onRemove}
                className="shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
            >
                Remove
            </button>
        </li>
    );
};
