"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

const BRANDS = ["All", "Nike", "Adidas", "Fog & Mist"];

const PRODUCTS = [
    { name: "Air Runner", brand: "Nike" },
    { name: "Court Classic", brand: "Nike" },
    { name: "Stripe Trainer", brand: "Adidas" },
    { name: "Terrace Low", brand: "Adidas" },
    { name: "Cloud Parka", brand: "Fog & Mist" },
    { name: "Drizzle Shell", brand: "Fog & Mist" },
];

export const CatalogFilters = () => {
    const [brand, setBrand] = useState("All");
    const [search, setSearch] = useState("");

    const handlePopState = () => {
        {
            const params = new URLSearchParams(location.search);
            setBrand(params.get("brand") || "All");
            setSearch(params.get("q") || "");
        }
    };

    useEffect(() => {
        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const pickBrand = (next: string) => {
        setBrand(next);
        // Put the filter in the URL so the view is shareable.
        const params = new URLSearchParams(location.search);
        params.set("brand", next);
        window.history.pushState({ brand: next }, "", `/?${params.toString()}`);
    };

    const onSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setSearch(text);
        // Keep the URL in sync with what's on screen, keystroke by keystroke.
        const params = new URLSearchParams(location.search);
        params.set("q", text);
        window.history.replaceState(
            { brand, search: text },
            "",
            `/?${params.toString()}`
        );
    };

    const visible = PRODUCTS.filter(
        (product) =>
            (brand === "All" || product.brand === brand) &&
            product.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Catalog</h2>

                <div className="flex flex-wrap gap-2">
                    {BRANDS.map((name) => (
                        <button
                            key={name}
                            onClick={() => pickBrand(name)}
                            data-testid={`brand-${name}`}
                            className={`rounded px-3 py-1 text-sm ${
                                name === brand
                                    ? "bg-gray-900 text-white"
                                    : "border border-gray-300 text-gray-900"
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                <input
                    data-testid="search"
                    value={search}
                    onChange={onSearch}
                    placeholder="Search products"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />

                <p className="text-xs text-gray-700">
                    Showing{" "}
                    <span data-testid="active-brand" className="font-semibold">
                        {brand}
                    </span>
                </p>

                <ul className="space-y-1">
                    {visible.map((product) => (
                        <li
                            key={product.name}
                            data-testid="product"
                            className="rounded border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
                        >
                            {product.name}
                            <span className="ml-2 text-xs text-gray-500">
                                {product.brand}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
