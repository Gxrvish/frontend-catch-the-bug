"use client";

import { useState } from "react";

import { ProductCard } from "./ProductCard";
import type { ProductCategory, SortOrder } from "./productGrid.types";
import { PRODUCTS, sortProducts } from "./productGridData";

const CATEGORIES: (ProductCategory | "all")[] = [
    "all",
    "electronics",
    "home",
    "books",
];

export const ProductGrid = () => {
    const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
    const [category, setCategory] = useState<ProductCategory | "all">("all");

    const visible = sortProducts(
        category === "all"
            ? PRODUCTS
            : PRODUCTS.filter((p) => p.category === category),
        sortOrder
    );

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Product Grid
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Pick a quantity, add to cart, then re-sort or filter the
                    grid.
                </p>

                <div className="mb-4 flex items-center gap-3">
                    <select
                        aria-label="sort order"
                        value={sortOrder}
                        onChange={(e) =>
                            setSortOrder(e.target.value as SortOrder)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Avg. Rating</option>
                    </select>

                    <div className="flex gap-1">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    category === c
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-600"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {visible.map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
                </div>
            </div>
        </main>
    );
};
