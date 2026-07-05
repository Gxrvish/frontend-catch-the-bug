"use client";

import { useState } from "react";

import type { Product } from "./productGrid.types";

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    // Per-card UI state: the quantity the user picked and whether they
    // already added this product to the cart.
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    return (
        <div
            data-testid={`product-card-${product.id}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
            <h4 className="mb-1 text-sm font-semibold text-gray-900">
                {product.name}
            </h4>
            <p className="mb-3 text-xs text-gray-500">
                ${product.price.toFixed(2)} · ★ {product.rating.toFixed(1)} ·{" "}
                {product.category}
            </p>

            <div className="mb-3 flex items-center gap-2">
                <button
                    aria-label={`decrease quantity`}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-7 w-7 rounded border border-gray-300 text-sm text-gray-700"
                >
                    −
                </button>
                <input
                    type="number"
                    aria-label="quantity"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="h-7 w-14 rounded border border-gray-300 text-center text-sm text-gray-900"
                />
                <button
                    aria-label={`increase quantity`}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-7 w-7 rounded border border-gray-300 text-sm text-gray-700"
                >
                    +
                </button>
            </div>

            {added ? (
                <div className="rounded-lg bg-green-100 px-3 py-1.5 text-center text-xs font-medium text-green-700">
                    Added ✓
                </div>
            ) : (
                <button
                    onClick={() => setAdded(true)}
                    className="w-full rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                >
                    Add to Cart
                </button>
            )}
        </div>
    );
};
