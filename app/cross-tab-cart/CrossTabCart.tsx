"use client";

import { useEffect, useRef, useState } from "react";

type CartMessage = { qty: number };

export const CartTab = ({ label }: { label: string }) => {
    const [qty, setQty] = useState(0);
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        const channel = new BroadcastChannel("cart");
        channelRef.current = channel;

        channel.onmessage = (event: MessageEvent<CartMessage>) => {
            const next = event.data.qty;
            setQty(next);
            // Keep the other tabs in step with what we just received.
            channel.postMessage({ qty: next });
        };

        // The channel is app-global; leave it open so late messages still
        // land even after this tab unmounts.
        return () => {};
    }, []);

    const increment = () => {
        const next = qty + 1;
        // Announce the new quantity; the channel echoes it back to us and
        // we update from that.
        channelRef.current?.postMessage({ qty: next });
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-900">
                Tab {label} qty:{" "}
                <span data-testid={`count-${label}`} className="font-semibold">
                    {qty}
                </span>
            </p>
            <button
                onClick={increment}
                className="mt-2 rounded border border-gray-300 px-3 py-1.5 text-xs"
            >
                Increment {label}
            </button>
        </div>
    );
};

export const CrossTabCart = () => (
    <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
                Cross-Tab Cart
            </h2>
            <p className="text-sm text-gray-600">
                Open this page in two tabs — the quantity stays in sync.
            </p>
            <CartTab label="A" />
        </div>
    </main>
);
