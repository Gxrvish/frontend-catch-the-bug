import { useEffect, useState } from "react";

import type { PriceUpdate, UseLivePricesOptions } from "./livePrices.types";
import { INITIAL_PRICES, priceSocket, startAutoTicks } from "./pricesApi";

interface UseLivePricesReturn {
    prices: Record<string, number>;
    updateCount: number;
    listenerCount: number;
}

export function useLivePrices(
    options: UseLivePricesOptions = {}
): UseLivePricesReturn {
    const { autoTicks = true } = options;

    const [prices, setPrices] =
        useState<Record<string, number>>(INITIAL_PRICES);
    const [updateCount, setUpdateCount] = useState(0);

    useEffect(() => {
        const handleUpdate = (update: PriceUpdate) => {
            setPrices((prev) => ({ ...prev, [update.symbol]: update.price }));
            setUpdateCount((count) => count + 1);
        };

        // Subscribe through a thin wrapper so the socket always sees a plain
        // one-argument function, whatever shape `handleUpdate` takes later.
        priceSocket.on((update) => handleUpdate(update));

        return () => {
            priceSocket.off(handleUpdate);
        };
    }, []);

    useEffect(() => {
        if (!autoTicks) {
            return;
        }
        const stop = startAutoTicks(1500);
        return stop;
    }, [autoTicks]);

    return {
        prices,
        updateCount,
        listenerCount: priceSocket.listenerCount(),
    };
}
