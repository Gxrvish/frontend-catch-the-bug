"use client";

import { addItem } from "./store";
import { useStore } from "./useStore";

const badgeProbe = { renders: 0 };
export const getBadgeRenders = () => badgeProbe.renders;
export const _resetBadgeRenders = () => {
    badgeProbe.renders = 0;
};

export const CartBadge = () => {
    // eslint-disable-next-line react-hooks/immutability -- render probe for the over-render test
    badgeProbe.renders += 1;

    // Pull the active (in-stock) items so we can show how many there are.
    const active = useStore((state) =>
        state.items.filter((item) => item.qty > 0)
    );

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-900">
                Active items:{" "}
                <span data-testid="active-count" className="font-semibold">
                    {active.length}
                </span>
            </p>
            <div className="mt-2 flex gap-2">
                <button
                    onClick={() => addItem(`z-${Date.now()}`, 0)}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                    Add empty slot
                </button>
                <button
                    onClick={() => addItem(`p-${Date.now()}`, 1)}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                    Add product
                </button>
            </div>
        </div>
    );
};
