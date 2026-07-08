"use client";

import { useEffect, useState } from "react";

import { fetchPage } from "./newsApi";
import type { Article } from "./newsFeed.types";

const PAGE_SIZE = 5;

export const NewsFeed = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchPage({ offset: 0, limit: PAGE_SIZE }).then((page) => {
            if (!cancelled) {
                setArticles(page);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const loadMore = async () => {
        setLoading(true);
        // Offset is simply how many articles we already show — the two
        // numbers can never drift apart.
        const next = await fetchPage({
            offset: articles.length,
            limit: PAGE_SIZE,
        });
        setArticles((prev) => [...prev, ...next]);
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    City News
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Latest first — load more to read older stories.
                </p>

                <ul className="space-y-3">
                    {articles.map((article) => (
                        <li key={article.id}>
                            <article
                                data-testid="news-article"
                                data-article-id={article.id}
                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {article.title}
                                </h3>
                                <p className="mt-1 text-xs text-gray-600">
                                    {article.summary}
                                </p>
                            </article>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={loadMore}
                    disabled={loading}
                    className="mt-4 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Loading…" : "Load more"}
                </button>
            </div>
        </main>
    );
};
