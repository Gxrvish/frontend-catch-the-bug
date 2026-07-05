import type { PriceListener, PriceUpdate } from "./livePrices.types";

const SYMBOLS = ["BTC", "ETH", "SOL", "DOGE"];

const BASE_PRICES: Record<string, number> = {
    BTC: 67230,
    ETH: 3540,
    SOL: 142,
    DOGE: 0.31,
};

const listeners = new Set<PriceListener>();

/**
 * Simulated market-data socket. One process-wide connection, listeners come
 * and go — exactly like a real ws client wrapper.
 */
export const priceSocket = {
    on(listener: PriceListener) {
        listeners.add(listener);
    },
    off(listener: PriceListener) {
        listeners.delete(listener);
    },
    emit(update: PriceUpdate) {
        for (const listener of [...listeners]) {
            listener(update);
        }
    },
    listenerCount() {
        return listeners.size;
    },
    /** Test helper: drop every listener between test cases. */
    reset() {
        listeners.clear();
    },
};

/** Emit one simulated tick for a random symbol. */
export const emitMarketTick = (partial?: Partial<PriceUpdate>) => {
    const symbol =
        partial?.symbol ?? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const base = BASE_PRICES[symbol] ?? 100;
    priceSocket.emit({
        symbol,
        price:
            partial?.price ??
            Number((base * (0.99 + Math.random() * 0.02)).toFixed(2)),
        at: partial?.at ?? Date.now(),
    });
};

/** Start the ambient feed for the real page; returns a stop function. */
export const startAutoTicks = (intervalMs: number) => {
    const id = setInterval(() => emitMarketTick(), intervalMs);
    return () => clearInterval(id);
};

export const INITIAL_PRICES: Record<string, number> = { ...BASE_PRICES };
