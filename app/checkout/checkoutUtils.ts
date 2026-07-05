import type { CartItem, ShippingMethod, Totals } from "./checkout.types";

export const SHIPPING_COST: Record<ShippingMethod, number> = {
    standard: 5,
    express: 15,
};

export const VALID_COUPONS: Record<string, { percentOff: number }> = {
    SAVE10: { percentOff: 10 },
    SAVE25: { percentOff: 25 },
};

export function computeTotals(
    items: CartItem[],
    coupon: string | null,
    shipping: ShippingMethod
): Totals {
    const subtotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );
    const percentOff =
        coupon !== null ? (VALID_COUPONS[coupon]?.percentOff ?? 0) : 0;
    const discount = (subtotal * percentOff) / 100;
    const shippingCost = SHIPPING_COST[shipping];

    return {
        subtotal,
        discount,
        shippingCost,
        total: subtotal - discount + shippingCost,
    };
}

export const formatMoney = (amount: number): string => `$${amount.toFixed(2)}`;
