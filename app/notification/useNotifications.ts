import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
    Notification,
    NotificationFilters,
    NotificationsState,
    NotificationType,
    ReadStatusFilter,
    UseNotificationsOptions,
} from "./notification.types";
import {
    dismissApi,
    fetchNotifications,
    markAllAsReadApi,
    markAsReadApi,
} from "./notificationApi";
import {
    applyFilters,
    countUnread,
    mergeNotificationBatches,
} from "./notificationUtils";

interface UseNotificationsReturn extends NotificationsState {
    filtered: Notification[];
    filters: NotificationFilters;
    setFilterType: (t: NotificationType | "all") => void;
    setFilterReadStatus: (s: ReadStatusFilter) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    dismiss: (id: string) => Promise<void>;
}

export function useNotifications(
    options: UseNotificationsOptions = {}
): UseNotificationsReturn {
    const { pollIntervalMs = 3000, maxVisibleItems = 80 } = options;

    const [items, setItems] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [filters, setFilters] = useState<NotificationFilters>({
        type: "all",
        readStatus: "all",
    });

    const pendingReads = useRef<Set<string>>(new Set());
    const pendingDismissals = useRef<Set<string>>(new Set());

    useEffect(() => {
        let isActive = true;
        let lastController: AbortController | null = null;

        const poll = async () => {
            const controller = new AbortController();
            lastController = controller;

            try {
                const batch = await fetchNotifications(controller.signal);
                if (isActive && !controller.signal.aborted) {
                    setItems((prev) => {
                        const merged = mergeNotificationBatches(
                            prev,
                            batch,
                            pendingReads
                        );
                        return merged.length > maxVisibleItems
                            ? merged.slice(0, maxVisibleItems)
                            : merged;
                    });
                    setError(null);
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError")
                    return;
                if (isActive) setError(err as Error);
            } finally {
                if (lastController === controller) setIsLoading(false);
            }
        };

        poll();
        const intervalId = setInterval(poll, pollIntervalMs);

        return () => {
            isActive = false;
            clearInterval(intervalId);
            lastController?.abort();
        };
    }, [pollIntervalMs, maxVisibleItems]);

    const markAsRead = useCallback(async (id: string) => {
        pendingReads.current.add(id);

        setItems((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true, updatedAt: Date.now() } : n
            )
        );

        try {
            await markAsReadApi(id);
        } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                setItems((prev) =>
                    prev.map((n) =>
                        n.id === id && pendingReads.current.has(id)
                            ? { ...n, isRead: false }
                            : n
                    )
                );
            }
        } finally {
            pendingReads.current.delete(id);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const unreadIds = items.filter((n) => !n.isRead).map((n) => n.id);
        if (unreadIds.length === 0) return;

        unreadIds.forEach((id) => pendingReads.current.add(id));

        setItems((prev) =>
            prev.map((n) => ({ ...n, isRead: true, updatedAt: Date.now() }))
        );

        try {
            await markAllAsReadApi(unreadIds);
        } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                setItems((prev) =>
                    prev.map((n) =>
                        pendingReads.current.has(n.id)
                            ? { ...n, isRead: false }
                            : n
                    )
                );
            }
        } finally {
            unreadIds.forEach((id) => pendingReads.current.delete(id));
        }
    }, [items]);

    const dismiss = useCallback(async (id: string) => {
        pendingDismissals.current.add(id);
        setItems((prev) => prev.filter((n) => n.id !== id));

        try {
            await dismissApi(id);
        } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                console.error(
                    "[useNotifications] dismiss failed, notification already removed locally",
                    err
                );
            }
        } finally {
            pendingDismissals.current.delete(id);
        }
    }, []);

    const unreadCount = useMemo(() => countUnread(items), [items]);

    const filtered = useMemo(
        () => applyFilters(items, filters),
        [items, filters]
    );

    const setFilterType = useCallback(
        (type: NotificationType | "all") =>
            setFilters((prev) => ({ ...prev, type })),
        []
    );

    const setFilterReadStatus = useCallback(
        (readStatus: ReadStatusFilter) =>
            setFilters((prev) => ({ ...prev, readStatus })),
        []
    );

    return {
        items,
        unreadCount,
        isLoading,
        error,
        filtered,
        filters,
        setFilterType,
        setFilterReadStatus,
        markAsRead,
        markAllAsRead,
        dismiss,
    };
}
