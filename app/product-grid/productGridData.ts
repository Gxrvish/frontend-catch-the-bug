import type { Product, SortOrder } from "./productGrid.types";

export const PRODUCTS: Product[] = [
    {
        id: "p-1",
        name: "Mechanical Keyboard",
        price: 129.99,
        rating: 4.7,
        category: "electronics",
    },
    {
        id: "p-2",
        name: "Noise Cancelling Headphones",
        price: 249.0,
        rating: 4.5,
        category: "electronics",
    },
    {
        id: "p-3",
        name: "Standing Desk",
        price: 399.0,
        rating: 4.2,
        category: "home",
    },
    {
        id: "p-4",
        name: "Ergonomic Chair",
        price: 310.5,
        rating: 4.8,
        category: "home",
    },
    {
        id: "p-5",
        name: "USB-C Hub",
        price: 39.99,
        rating: 3.9,
        category: "electronics",
    },
    {
        id: "p-6",
        name: "Desk Lamp",
        price: 24.5,
        rating: 4.1,
        category: "home",
    },
    {
        id: "p-7",
        name: "Clean Architecture",
        price: 32.0,
        rating: 4.6,
        category: "books",
    },
    {
        id: "p-8",
        name: "Designing Data-Intensive Applications",
        price: 44.99,
        rating: 4.9,
        category: "books",
    },
];

const COMPARATORS: Record<SortOrder, (a: Product, b: Product) => number> = {
    featured: () => 0,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
};

export function sortProducts(products: Product[], order: SortOrder): Product[] {
    return [...products].sort(COMPARATORS[order]);
}
