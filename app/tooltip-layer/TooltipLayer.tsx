"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { readRect, writeTop } from "./layoutOps";

const BADGES = ["Design", "Build", "Ship", "Verify"];

// The perf team's paint probe: it records what the tooltip's `top` was at the
// moment the browser was free to paint the first frame.
const paintProbe = { top: "" };
export const getPaintTop = () => paintProbe.top;
export const _resetPaintProbe = () => {
    paintProbe.top = "";
};

const Tooltip = () => {
    const anchorRef = useRef<HTMLButtonElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);

    // Park the tip right under its anchor once the DOM exists.
    useEffect(() => {
        const anchor = anchorRef.current;
        const tip = tipRef.current;
        if (!anchor || !tip) return;

        const rect = readRect(anchor);
        writeTop(tip, rect.top + rect.height);
    }, []);

    return (
        <div className="relative rounded border border-gray-200 bg-white p-4">
            <button
                ref={anchorRef}
                data-layout-id="anchor"
                data-testid="anchor"
                className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
            >
                Release notes
            </button>
            <div
                ref={tipRef}
                data-layout-id="tooltip"
                data-testid="tooltip"
                className="absolute left-0 rounded bg-gray-900 px-2 py-1 text-xs text-white"
                style={{ position: "absolute" }}
            >
                Ships Friday
            </div>
        </div>
    );
};

const PaintProbe = () => {
    useLayoutEffect(() => {
        const tip = document.querySelector<HTMLElement>(
            '[data-testid="tooltip"]'
        );
        paintProbe.top = tip?.style.top ?? "";
    }, []);

    return null;
};

export const TooltipLayer = () => {
    const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

    const rebalance = () => {
        // Stack the badges: measure each one, then drop it into place.
        let offset = 0;
        badgeRefs.current.forEach((badge) => {
            if (!badge) return;
            const rect = readRect(badge);
            writeTop(badge, offset);
            offset += rect.height + 4;
        });
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Release Board
                </h2>

                <Tooltip />
                <PaintProbe />

                <div className="space-y-2">
                    {BADGES.map((badge, index) => (
                        <div
                            key={badge}
                            ref={(el) => {
                                badgeRefs.current[index] = el;
                            }}
                            data-layout-id={`badge-${index}`}
                            data-testid="badge"
                            className="relative rounded border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
                        >
                            {badge}
                        </div>
                    ))}
                </div>

                <button
                    onClick={rebalance}
                    className="rounded bg-gray-900 px-3 py-1 text-sm text-white"
                >
                    Re-measure badges
                </button>
            </div>
        </main>
    );
};
