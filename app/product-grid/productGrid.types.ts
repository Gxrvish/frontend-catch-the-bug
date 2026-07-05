export interface Product {
    id: string;
    name: string;
    price: number;
    rating: number;
    category: ProductCategory;
}

export type ProductCategory = "electronics" | "home" | "books";

export type SortOrder = "featured" | "price-asc" | "price-desc" | "rating";
