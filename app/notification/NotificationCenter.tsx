"use client";

import React, { memo, useCallback, useState } from "react";

import type { Notification, NotificationType } from "./notification.types";
import { useNotifications } from "./useNotifications";

const TYPE_STYLES: Record<NotificationType, string> = {
    info: "border-l-blue-500 bg-blue-50",
    warning: "border-l-amber-500 bg-amber-50",
    error: "border-l-red-500 bg-red-50",
    success: "border-l-green-500 bg-green-50",
};

const TYPE_BADGE: Record<NotificationType, string> = {
    info: "text-blue-700",
    warning: "text-amber-700",
    error: "text-red-700",
    success: "text-green-700",
};

interface NotificationRowProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDismiss: (id: string) => void;
}

const NotificationRow = memo<NotificationRowProps>(function NotificationRow({
    notification,
    onMarkRead,
    onDismiss,
}) {
    const handleMarkRead = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onMarkRead(notification.id);
        },
        [notification.id, onMarkRead]
    );

    const handleDismiss = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onDismiss(notification.id);
        },
        [notification.id, onDismiss]
    );

    return (
        <div
            className={`border-l-4 p-4 rounded shadow-sm transition-opacity ${TYPE_STYLES[notification.type]} ${
                notification.isRead ? "opacity-60" : "opacity-100"
            }`}
            data-testid={`notification-${notification.id}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className={`text-xs font-semibold uppercase tracking-wide ${TYPE_BADGE[notification.type]}`}
                        >
                            {notification.type}
                        </span>
                        {!notification.isRead && (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                        )}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                        <button
                            onClick={handleMarkRead}
                            className="text-xs px-2 py-1 rounded hover:bg-white/70 text-gray-700"
                            aria-label="Mark as read"
                        >
                            ✓
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="text-xs px-2 py-1 rounded hover:bg-white/70 text-gray-500"
                        aria-label="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-2">
                {new Date(notification.createdAt).toLocaleTimeString()}
            </div>
        </div>
    );
});

interface NotificationCenterProps {
    pollIntervalMs?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    pollIntervalMs = 3000,
}) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const {
        filtered,
        unreadCount,
        isLoading,
        error,
        filters,
        setFilterType,
        setFilterReadStatus,
        markAsRead,
        markAllAsRead,
        dismiss,
    } = useNotifications({ pollIntervalMs });

    const handleToggle = useCallback(() => setIsPanelOpen((p) => !p), []);

    const handleMarkAll = useCallback(() => {
        markAllAsRead();
    }, [markAllAsRead]);

    return (
        <div className="relative" data-testid="notification-center">
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle notifications"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold px-1"
                        data-testid="unread-badge"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isPanelOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsPanelOpen(false)}
                    />
                    <div
                        className="absolute right-0 top-12 w-96 max-h-[520px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
                        data-testid="notification-panel"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Notifications
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAll}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                            <select
                                value={filters.type ?? "all"}
                                onChange={(e) =>
                                    setFilterType(
                                        e.target.value as
                                            | NotificationType
                                            | "all"
                                    )
                                }
                                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                            >
                                <option value="all">All types</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="success">Success</option>
                            </select>
                            <select
                                value={filters.readStatus ?? "all"}
                                onChange={(e) =>
                                    setFilterReadStatus(
                                        e.target.value as
                                            | "all"
                                            | "read"
                                            | "unread"
                                    )
                                }
                                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                            >
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading && filtered.length === 0 && (
                                <div className="p-6 text-center text-sm text-gray-400">
                                    Loading…
                                </div>
                            )}

                            {error && (
                                <div
                                    className="p-4 text-center text-sm text-red-600"
                                    role="alert"
                                >
                                    Failed to load notifications. Retrying…
                                </div>
                            )}

                            {!isLoading && !error && filtered.length === 0 && (
                                <div className="p-6 text-center text-sm text-gray-400">
                                    No notifications
                                </div>
                            )}

                            <div className="divide-y divide-gray-100">
                                {filtered.map((n) => (
                                    <NotificationRow
                                        key={n.id}
                                        notification={n}
                                        onMarkRead={markAsRead}
                                        onDismiss={dismiss}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-center">
                            <span className="text-[10px] text-gray-400">
                                Polling every {pollIntervalMs / 1000}s ·{" "}
                                {unreadCount} unread
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
