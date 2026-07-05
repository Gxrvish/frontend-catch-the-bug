export interface PriceUpdate {
    symbol: string;
    price: number;
    at: number;
}

export type PriceListener = (update: PriceUpdate) => void;

export interface UseLivePricesOptions {
    /** Emit simulated market ticks automatically (on for the real page). */
    autoTicks?: boolean;
}
