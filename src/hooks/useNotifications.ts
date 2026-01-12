"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { notificationService } from "@/services/notification.service";
import { socketService } from "@/services/socket.service";
import {
    Notification,
    NotificationFilterOptions,
} from "@/types/notification";

interface UseNotificationsOptions {
    autoConnect?: boolean;
    limit?: number;
}

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    total: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    markAsRead: (notificationId: number) => Promise<void>;
    isMarkingRead: number | null;
}

export function useNotifications(
    options: UseNotificationsOptions = {}
): UseNotificationsReturn {
    const { autoConnect = true, limit = 10 } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isMarkingRead, setIsMarkingRead] = useState<number | null>(null);

    const isInitialMount = useRef(true);

    // Fetch notifications
    const fetchNotifications = useCallback(
        async (page: number = 1, append: boolean = false) => {
            // Skip if running on server
            if (typeof window === "undefined") return;

            try {
                setIsLoading(true);
                setError(null);

                const params: NotificationFilterOptions = { page, limit };
                const response = await notificationService.getNotifications(params);

                setNotifications((prev) =>
                    append ? [...prev, ...response.notifications] : response.notifications
                );
                setUnreadCount(response.unreadCount);
                setCurrentPage(response.currentPage);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            } catch (err: any) {
                setError(err.message || "Failed to fetch notifications");
                console.error("Error fetching notifications:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [limit]
    );

    // Load more notifications
    const loadMore = useCallback(async () => {
        if (currentPage < totalPages && !isLoading) {
            await fetchNotifications(currentPage + 1, true);
        }
    }, [currentPage, totalPages, isLoading, fetchNotifications]);

    // Refresh notifications
    const refresh = useCallback(async () => {
        await fetchNotifications(1, false);
    }, [fetchNotifications]);

    // Mark notification as read
    const markAsRead = useCallback(
        async (notificationId: number) => {
            if (isMarkingRead === notificationId) return;

            try {
                setIsMarkingRead(notificationId);

                const updated = await notificationService.markAsRead(notificationId);

                // Update local state
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.id === notificationId
                            ? {
                                ...notif,
                                isRead: updated.isRead,
                                readAt: updated.readAt,
                            }
                            : notif
                    )
                );

                // Decrease unread count if it was unread before
                const wasUnread = notifications.find(
                    (n) => n.id === notificationId
                )?.isRead === false;
                if (wasUnread) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            } catch (err: any) {
                console.error("Error marking notification as read:", err);
            } finally {
                setIsMarkingRead(null);
            }
        },
        [isMarkingRead, notifications]
    );

    // Setup Socket.IO connection and listeners
    useEffect(() => {
        // Skip on server-side
        if (typeof window === "undefined") return;
        if (!autoConnect) return;

        // Get token from localStorage or your auth context
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Connect to socket
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        // Extract userId from token if needed (you might have this in auth context)
        // For now, we'll connect without userId
        socketService.connect(token, baseUrl);

        // Subscribe to new notifications
        const unsubscribe = socketService.onNotification((notification) => {
            // Add new notification to the top of the list
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            setTotal((prev) => prev + 1);
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
            socketService.disconnect();
        };
    }, [autoConnect]);

    // Initial fetch
    useEffect(() => {
        // Skip on server-side
        if (typeof window === "undefined") return;

        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchNotifications(1, false);
        }
    }, [fetchNotifications]);

    const hasMore = currentPage < totalPages;

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        hasMore,
        loadMore,
        refresh,
        markAsRead,
        isMarkingRead,
    };
}
