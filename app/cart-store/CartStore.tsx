"use client";

import { CartBadge } from "./CartBadge";
import { increment } from "./store";
import { useStore } from "./useStore";

export const CartStore = () => {
    const count = useStore((state) => state.count);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Cart Store
                </h2>

                <p className="text-sm text-gray-900">
                    Clicks:{" "}
                    <span data-testid="count" className="font-semibold">
                        {count}
                    </span>
                </p>
                <button
                    onClick={() => increment()}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs"
                >
                    Increment
                </button>

                <CartBadge />
            </div>
        </main>
    );
};
