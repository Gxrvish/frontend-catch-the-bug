"use client";

import { useEffect, useRef, useState } from "react";

import { type FeedItem, fetchPage, fetchPrevious } from "./feedApi";

const ITEM_HEIGHT = 40;

export const InfiniteFeed = () => {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [nextCursor, setNextCursor] = useState("0");
    const [prevCursor, setPrevCursor] = useState("-1");
    const [loading, setLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

    const loadNext = () => {
        // The loading flag guards against firing the same page twice.
        if (loading) {
            return;
        }
        setLoading(true);
        fetchPage(nextCursor).then((page) => {
            setItems((prev) => [...prev, ...page.items]);
            setNextCursor(page.nextCursor);
            setLoading(false);
        });
    };

    const loadPrevious = () => {
        fetchPrevious(prevCursor).then((page) => {
            setItems((prev) => [...page.items, ...prev]);
            setPrevCursor(page.prevCursor);
            // React keeps the DOM stable and the browser holds our place,
            // so no scroll bookkeeping is needed after a prepend.
        });
    };

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) {
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                loadNext();
            }
        });
        observer.observe(sentinel);
        // One observer per sentinel; React swaps them cleanly on its own.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- observe once on mount, see comment
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Activity Stream
                </h2>
                <p className="mb-3 text-sm text-gray-600">
                    Scroll for more; load older entries above.
                </p>

                <button
                    onClick={loadPrevious}
                    className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
                >
                    Load previous
                </button>

                <div
                    ref={scrollerRef}
                    data-testid="feed-scroller"
                    className="h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white"
                >
                    <ul>
                        {items.map((item) => (
                            <li
                                key={item.id}
                                data-testid="feed-item"
                                style={{ height: ITEM_HEIGHT }}
                                className="flex items-center border-b border-gray-100 px-3 text-sm text-gray-800"
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                    <div ref={sentinelRef} data-testid="sentinel" />
                </div>
            </div>
        </main>
    );
};
