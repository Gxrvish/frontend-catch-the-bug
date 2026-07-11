"use client";

import { useMemo, useState } from "react";

import { TRACKS } from "./trackData";
import { TrackRow } from "./TrackRow";

const MIN_LONG_TRACK_SEC = 180;

const formatRuntime = (totalSec: number) =>
    `${Math.floor(totalSec / 60)}m ${(totalSec % 60)
        .toString()
        .padStart(2, "0")}s`;

export const PlaylistEditor = () => {
    const [tracks, setTracks] = useState(TRACKS);
    const [hideShort, setHideShort] = useState(false);

    const totalRuntime = useMemo(
        () => tracks.reduce((sum, track) => sum + track.durationSec, 0),
        // The library itself doesn't change during a session — only its
        // ordering does — so the total only ever needs computing once.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot computation
        []
    );

    const sortByDuration = () => {
        setTracks((prev) =>
            [...prev].sort((a, b) => a.durationSec - b.durationSec)
        );
    };

    const removeTrack = (id: string) => {
        setTracks((prev) => prev.filter((track) => track.id !== id));
    };

    const visibleTracks = hideShort
        ? tracks.filter((track) => track.durationSec >= MIN_LONG_TRACK_SEC)
        : tracks;

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Road Trip Mix
                </h2>
                <p
                    data-testid="total-runtime"
                    className="mb-4 text-sm text-gray-600"
                >
                    Total runtime: {formatRuntime(totalRuntime)}
                </p>

                <div className="mb-4 flex items-center gap-4">
                    <button
                        onClick={sortByDuration}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                        Sort by duration
                    </button>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={hideShort}
                            onChange={(e) => setHideShort(e.target.checked)}
                        />
                        Hide tracks under 3 minutes
                    </label>
                </div>

                <ul className="space-y-2">
                    {/* Position is the one thing that's always unique in an
                        array, so the index makes a collision-proof key. */}
                    {visibleTracks.map((track, index) => (
                        <TrackRow
                            key={index}
                            track={track}
                            onRemove={() => removeTrack(track.id)}
                        />
                    ))}
                </ul>
            </div>
        </main>
    );
};
