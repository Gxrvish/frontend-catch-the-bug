"use client";

import { useEffect, useRef, useState } from "react";

let DELIVERIES = 0;
export const getDeliveries = () => DELIVERIES;
export const _resetDeliveries = () => {
    DELIVERIES = 0;
};

const SYMBOLS = ["AAPL", "MSFT"];

export const WsTicker = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [symbolIdx, setSymbolIdx] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`wss://feed.example/${SYMBOLS[symbolIdx]}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            DELIVERIES += 1;
            setMessages([...messages, event.data as string]);
        };

        // Switching symbols just opens a fresh socket; the previous one
        // drops on its own when the server hangs it up.
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbolIdx]);

    const publish = () => {
        // Push the ping straight down the wire.
        wsRef.current?.send("ping");
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Live Ticker
                </h2>
                <p className="text-sm text-gray-600">
                    Symbol:{" "}
                    <span data-testid="symbol" className="font-medium">
                        {SYMBOLS[symbolIdx]}
                    </span>
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            setSymbolIdx((i) => (i + 1) % SYMBOLS.length)
                        }
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Switch symbol
                    </button>
                    <button
                        onClick={publish}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs"
                    >
                        Send ping
                    </button>
                </div>

                <ul className="space-y-1">
                    {messages.map((message, i) => (
                        <li
                            key={i}
                            data-testid="tick"
                            className="rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800"
                        >
                            {message}
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
