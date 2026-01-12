import { ApiResponse, PaginationMeta } from "./api";

// Notification Type Enum - matches backend
export enum NotificationType {
    CHANGE_PASSWORD = "Change password",
    LIKE = "Like",
    COMMENT = "Comment",
    ORDER = "Order",
    WARNING = "Warning",
    CONTENT_DELETED = "CONTENT_DELETED",
    WITHDRAWAL_PROCESSING = "Withdrawal processing",
    WITHDRAWAL_COMPLETED = "Withdrawal completed",
    WITHDRAWAL_REJECTED = "Withdrawal rejected",
    WITHDRAWAL_FAILED = "Withdrawal failed",
}

// Notification Target Enum
export enum NotificationTarget {
    ALL = "All",
    ONLY_USER = "Only user",
    SEGMENT = "Segment",
}

// Notification data structure
export interface Notification {
    id: number;
    isRead: boolean;
    readAt: string | null;
    type: NotificationType;
    message: string | null;
    data: Record<string, any> | null;
    target: NotificationTarget | null;
    createdAt: string;
}

// API Response for notification list
export interface NotificationListResponse {
    total: number;
    unreadCount: number;
    currentPage: number;
    totalPages: number;
    notifications: Notification[];
}

// Filter options for fetching notifications
export interface NotificationFilterOptions {
    page?: number;
    limit?: number;
}

// Response for marking notification as read
export interface NotificationReadResponse {
    id: number;
    isRead: boolean;
    readAt: string | null;
    notification: {
        type: NotificationType;
        data: Record<string, any>;
        target: NotificationTarget;
    };
    createdAt: string;
}
