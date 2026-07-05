export interface CartItem {
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
}

export type ShippingMethod = "standard" | "express";

export interface Totals {
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
}

export interface CartContextValue {
    items: CartItem[];
    coupon: string | null;
    shipping: ShippingMethod;
    giftNote: string;
    updateQuantity: (id: string, quantity: number) => void;
    applyCoupon: (code: string) => void;
    setShipping: (method: ShippingMethod) => void;
    setGiftNote: (note: string) => void;
}
