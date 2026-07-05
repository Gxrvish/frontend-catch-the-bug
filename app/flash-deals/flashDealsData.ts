import type { Deal } from "./flashDeals.types";

export const DEALS: Deal[] = [
    { id: "d-1", name: "Wireless Earbuds", price: 39.99, listPrice: 89.99 },
    { id: "d-2", name: "Smart Bulb 4-Pack", price: 21.5, listPrice: 44.0 },
    { id: "d-3", name: "USB-C Hub", price: 27.0, listPrice: 59.0 },
];

/** The current flash window closes four hours after the bundle loads. */
export const DEALS_END_AT = Date.now() + 4 * 60 * 60 * 1000;

export const DISMISS_KEY = "flash-deals-dismissed";

export const formatTimeLeft = (msLeft: number): string => {
    const clamped = Math.max(0, msLeft);
    const hours = Math.floor(clamped / 3_600_000);
    const minutes = Math.floor((clamped % 3_600_000) / 60_000);
    const seconds = Math.floor((clamped % 60_000) / 1000);
    const millis = clamped % 1000;
    const pad = (n: number, w = 2) => String(n).padStart(w, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millis, 3)}`;
};
