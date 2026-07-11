"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import { type Cursor, getSnapshot, moveCursor, subscribe } from "./cursorStore";
import { debounce } from "./debounce";

const BROADCAST_WAIT = 50;
const MY_ID = "me";

export const CollabCursor = () => {
    // Read the shared cursor store: seed from the current snapshot, then
    // subscribe for future changes.
    const [peers, setPeers] = useState<Cursor[]>(getSnapshot());

    useLayoutEffect(() => {
        // A peer was already moving when we connected — their first
        // position arrives from the relay the moment the layer mounts.
        moveCursor("p-1", 320, 240);
    }, []);

    useEffect(() => {
        return subscribe(() => setPeers(getSnapshot()));
    }, []);

    // Show our own cursor instantly (optimistic), debounce the network
    // broadcast so we don't flood the wire.
    const [myPos, setMyPos] = useState({ x: 10, y: 10 });

    // Debounce our own outgoing cursor so we don't flood the wire.
    const broadcast = debounce((x: number, y: number) => {
        moveCursor(MY_ID, x, y);
    }, BROADCAST_WAIT);

    const nudge = (x: number, y: number) => {
        setMyPos({ x, y });
        broadcast(x, y);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-xl">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Live Cursors
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Everyone editing this doc, in real time. Your local
                    position:{" "}
                    <span data-testid="my-local-pos">
                        {myPos.x}, {myPos.y}
                    </span>
                </p>

                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => nudge(100, 100)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Move to 100,100
                    </button>
                    <button
                        onClick={() => nudge(200, 150)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Move to 200,150
                    </button>
                    <button
                        onClick={() => nudge(260, 220)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Move to 260,220
                    </button>
                    <button
                        onClick={() => nudge(300, 300)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Move to 300,300
                    </button>
                </div>

                <ul className="space-y-2">
                    {peers.map((peer) => (
                        <li
                            key={peer.peerId}
                            data-testid={`cursor-${peer.peerId}`}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800"
                        >
                            <span className="font-medium">{peer.name}</span>
                            <span data-testid={`pos-${peer.peerId}`}>
                                {peer.x}, {peer.y}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
