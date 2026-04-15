export type NotificationType = "info" | "warning" | "error" | "success";
export type NotificationCategory =
    | "system"
    | "social"
    | "promotional"
    | "transaction";
export type ReadStatusFilter = "all" | "read" | "unread";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    isRead: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface NotificationsState {
    items: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: Error | null;
}

export interface NotificationFilters {
    type?: NotificationType | "all";
    readStatus?: ReadStatusFilter;
}

export interface UseNotificationsOptions {
    pollIntervalMs?: number;
    maxVisibleItems?: number;
}
