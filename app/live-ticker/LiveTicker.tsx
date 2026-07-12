"use client";

import { useEffect, useRef, useState } from "react";

// Units advanced per second of wall-clock time.
const RATE = 1;

let FRAMES = 0;
export const getFrames = () => FRAMES;
export const _resetFrames = () => {
    FRAMES = 0;
};

export const LiveTicker = () => {
    const [value, setValue] = useState(0);
    const lastRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const loop = (now: number) => {
            FRAMES += 1;
            const dt = (now - lastRef.current) / 1000;
            lastRef.current = now;
            setValue((v) => v + RATE * dt);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        // The animation runs for the life of the widget.
        return () => {};
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Live Ticker
                </h2>
                <p className="text-sm text-gray-900">
                    Value:{" "}
                    <span data-testid="value" className="font-semibold">
                        {value.toFixed(3)}
                    </span>
                </p>
            </div>
        </main>
    );
};
