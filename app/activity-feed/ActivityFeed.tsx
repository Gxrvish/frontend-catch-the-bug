"use client";

import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { ActivityItem } from "./activityFeed.types";
import { useActivityFeed } from "./useActivityFeed";

const TYPE_ICON: Record<string, string> = {
    post: "📝",
    comment: "💬",
    reaction: "❤️",
    follow: "👤",
    share: "🔗",
};

const TYPE_LABEL: Record<string, string> = {
    post: "Post",
    comment: "Comment",
    reaction: "Reaction",
    follow: "Follow",
    share: "Share",
};

interface ActivityCardProps {
    item: ActivityItem;
    now: number;
    onLike: (id: string) => void;
    onDismiss: (id: string) => void;
}

const ActivityCard = memo<ActivityCardProps>(function ActivityCard({
    item,
    now,
    onLike,
    onDismiss,
}) {
    const handleLike = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            onLike(item.id);
        },
        [item.id, onLike]
    );

    const handleDismiss = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            onDismiss(item.id);
        },
        [item.id, onDismiss]
    );

    const timeAgo = useMemo(() => {
        const seconds = Math.floor((now - item.createdAt) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
    }, [item.createdAt, now]);

    return (
        <article
            className="group relative rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            data-testid={`activity-${item.id}`}
        >
            <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 p-1 text-sm text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100"
                aria-label="Dismiss"
            >
                ✕
            </button>

            <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                    {item.actor.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                        <span className="font-semibold">{item.actor.name}</span>{" "}
                        <span className="text-gray-600">{item.content}</span>
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                            <span>{TYPE_ICON[item.type]}</span>
                            {TYPE_LABEL[item.type]}
                        </span>

                        <span className="text-[11px] text-gray-400">
                            {timeAgo}
                        </span>

                        <button
                            onClick={handleLike}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                                item.isLiked
                                    ? "bg-red-50 font-medium text-red-600"
                                    : "text-gray-500 hover:bg-gray-100"
                            }`}
                            aria-label={item.isLiked ? "Unlike" : "Like"}
                            data-testid={`like-btn-${item.id}`}
                        >
                            <span>{item.isLiked ? "❤️" : "🤍"}</span>
                            {item.likeCount > 0 && (
                                <span>{item.likeCount}</span>
                            )}
                        </button>

                        {item.commentCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                💬 {item.commentCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
});

interface LoadMoreTriggerProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}

const LoadMoreTrigger = memo<LoadMoreTriggerProps>(function LoadMoreTrigger({
    hasMore,
    isLoading,
    onLoadMore,
}) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasMore || isLoading) return;

        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onLoadMore();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, isLoading, onLoadMore]);

    if (!hasMore) return null;

    return (
        <div ref={sentinelRef} className="py-6 text-center">
            {isLoading ? (
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                    <span className="animate-spin">⏳</span> Loading more…
                </div>
            ) : (
                <span className="text-sm text-gray-400">Scroll for more</span>
            )}
        </div>
    );
});

export const ActivityFeed: React.FC = () => {
    const {
        items,
        hasMore,
        isLoading,
        isLoadingMore,
        error,
        toggleLike,
        dismiss,
        loadMore,
    } = useActivityFeed({ pollIntervalMs: 3000, pageSize: 10 });

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <section
            className="mx-auto w-full max-w-lg"
            data-testid="activity-feed"
        >
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Activity
                </h2>
                <span className="text-xs text-gray-400">Live · 3s poll</span>
            </div>

            {error && (
                <div
                    className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    role="alert"
                >
                    Failed to sync. Retrying on next poll…
                </div>
            )}

            {isLoading && items.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">
                    Loading activity…
                </div>
            )}

            {!isLoading && items.length === 0 && !error && (
                <div className="py-12 text-center text-sm text-gray-400">
                    No activity yet
                </div>
            )}

            <div className="space-y-3">
                {items.map((item) => (
                    <ActivityCard
                        key={item.id}
                        item={item}
                        now={now}
                        onLike={toggleLike}
                        onDismiss={dismiss}
                    />
                ))}
            </div>

            <LoadMoreTrigger
                hasMore={hasMore}
                isLoading={isLoadingMore}
                onLoadMore={loadMore}
            />
        </section>
    );
};

export default ActivityFeed;
