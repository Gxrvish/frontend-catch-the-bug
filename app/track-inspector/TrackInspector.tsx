"use client";

import { useState } from "react";

import { TrackEditPanel } from "./TrackEditPanel";
import type { Track, TrackPatch } from "./trackInspector.types";
import { TRACKS } from "./trackLibrary";

export const TrackInspector = () => {
    const [tracks, setTracks] = useState<Track[]>(TRACKS);
    const [selectedId, setSelectedId] = useState<string>(TRACKS[0].id);

    const selected = tracks.find((t) => t.id === selectedId) ?? tracks[0];

    const saveTrack = (id: string, patch: TrackPatch) =>
        setTracks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
        );

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Track Inspector
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Select a track on the left, then look at what the edit panel
                    shows.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <ul className="space-y-2">
                        {tracks.map((track) => (
                            <li key={track.id}>
                                <button
                                    onClick={() => setSelectedId(track.id)}
                                    className={`w-full rounded-xl border p-3 text-left text-sm shadow-sm ${
                                        track.id === selectedId
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="block font-medium text-gray-900">
                                        {track.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {track.artist} · {track.bpm} BPM
                                        {track.explicit ? " · E" : ""}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <TrackEditPanel track={selected} onSave={saveTrack} />
                </div>
            </div>
        </main>
    );
};
