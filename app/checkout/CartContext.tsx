"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import type {
    CartContextValue,
    CartItem,
    ShippingMethod,
} from "./checkout.types";
import { VALID_COUPONS } from "./checkoutUtils";

const SEED_ITEMS: CartItem[] = [
    { id: "c-1", name: "Mechanical Keyboard", unitPrice: 100, quantity: 1 },
    { id: "c-2", name: "Wireless Mouse", unitPrice: 50, quantity: 2 },
];

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(SEED_ITEMS);
    const [coupon, setCoupon] = useState<string | null>(null);
    const [shipping, setShipping] = useState<ShippingMethod>("standard");
    const [giftNote, setGiftNote] = useState("");

    return (
        <CartContext.Provider
            value={{
                items,
                coupon,
                shipping,
                giftNote,
                updateQuantity: (id, quantity) =>
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, quantity: Math.max(1, quantity) }
                                : item
                        )
                    ),
                applyCoupon: (code) => {
                    if (VALID_COUPONS[code]) {
                        setCoupon(code);
                    }
                },
                setShipping,
                setGiftNote,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export function useCart(): CartContextValue {
    const value = useContext(CartContext);
    if (value === null) {
        throw new Error("useCart must be used inside <CartProvider>");
    }
    return value;
}
