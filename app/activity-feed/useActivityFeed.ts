import { useCallback, useEffect, useRef, useState } from "react";

import type { ActivityItem } from "./activityFeed.types";
import {
    dismissItemApi,
    fetchOlderItems,
    fetchRecentItems,
    toggleLikeApi,
} from "./activityFeedApi";
import { mergeServerBatch, rollbackLikeState } from "./activityFeedUtils";

interface UseActivityFeedOptions {
    pollIntervalMs?: number;
    pageSize?: number;
}

interface UseActivityFeedReturn {
    items: ActivityItem[];
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: Error | null;
    toggleLike: (itemId: string) => void;
    dismiss: (itemId: string) => void;
    loadMore: () => void;
}

export function useActivityFeed(
    options: UseActivityFeedOptions = {}
): UseActivityFeedReturn {
    const { pollIntervalMs = 3000, pageSize = 10 } = options;

    const [items, setItems] = useState<ActivityItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const pendingLikes = useRef<Map<string, boolean>>(new Map());
    const pendingDismissals = useRef<Set<string>>(new Set());

    useEffect(() => {
        let active = true;
        let controller: AbortController | null = null;

        const poll = async () => {
            const ctrl = new AbortController();
            controller = ctrl;

            try {
                const page = await fetchRecentItems(ctrl.signal);

                if (active && !ctrl.signal.aborted) {
                    setItems((prev) => mergeServerBatch(prev, page.items));
                    setHasMore(page.hasMore);
                    setError(null);
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }
                if (active) setError(err as Error);
            } finally {
                if (active && controller === ctrl) setIsLoading(false);
            }
        };

        poll();
        const intervalId = setInterval(poll, pollIntervalMs);

        return () => {
            active = false;
            clearInterval(intervalId);
            controller?.abort();
        };
    }, [pollIntervalMs]);

    const toggleLike = useCallback((itemId: string) => {
        setItems((prev) => {
            const target = prev.find((i) => i.id === itemId);
            if (!target) return prev;

            const nextLiked = !target.isLiked;
            pendingLikes.current.set(itemId, nextLiked);

            return prev.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          isLiked: nextLiked,
                          likeCount: nextLiked
                              ? item.likeCount + 1
                              : Math.max(0, item.likeCount - 1),
                      }
                    : item
            );
        });

        (async () => {
            try {
                const serverItem = await toggleLikeApi(itemId);
                pendingLikes.current.delete(itemId);
                setItems((prev) =>
                    prev.map((item) => (item.id === itemId ? serverItem : item))
                );
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }

                const wasPending = pendingLikes.current.has(itemId);
                pendingLikes.current.delete(itemId);

                if (wasPending) {
                    setItems((prev) => rollbackLikeState(prev, itemId));
                }
            }
        })();
    }, []);

    const dismiss = useCallback((itemId: string) => {
        pendingDismissals.current.add(itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));

        (async () => {
            try {
                await dismissItemApi(itemId);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }
                console.warn(
                    "[useActivityFeed] dismiss failed for",
                    itemId,
                    err
                );
            } finally {
                pendingDismissals.current.delete(itemId);
            }
        })();
    }, []);

    const loadMore = useCallback(() => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        const anchorId =
            items.length > 0 ? (items[items.length - 1]?.id ?? "") : "";

        (async () => {
            try {
                const page = await fetchOlderItems(anchorId, pageSize);
                setItems((prev) => mergeServerBatch(prev, page.items));
                setHasMore(page.hasMore);
            } catch (err) {
                if (
                    !(err instanceof DOMException && err.name === "AbortError")
                ) {
                    setError(err as Error);
                }
            } finally {
                setIsLoadingMore(false);
            }
        })();
    }, [isLoadingMore, hasMore, items, pageSize]);

    return {
        items,
        hasMore,
        isLoading,
        isLoadingMore,
        error,
        toggleLike,
        dismiss,
        loadMore,
    };
}
