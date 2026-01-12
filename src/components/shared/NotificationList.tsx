"use client";

import { Notification } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";
import { Bell, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationListProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    isMarkingRead: number | null;
    hasMore: boolean;
    isLoading: boolean;
    error: string | null;
    onLoadMore: () => void;
    showLoadMoreButton?: boolean;
}

export function NotificationList({
    notifications,
    onNotificationClick,
    isMarkingRead,
    hasMore,
    isLoading,
    error,
    onLoadMore,
    showLoadMoreButton = true,
}: NotificationListProps) {
    // Error state
    if (error && notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <AlertCircle className="w-12 h-12 text-[var(--error)] mb-3" />
                <p className="text-sm text-[var(--neutral-900)] font-medium mb-1">
                    Không thể tải thông báo
                </p>
                <p className="text-xs text-[var(--neutral-600)] text-center">
                    {error}
                </p>
            </div>
        );
    }

    // Empty state
    if (notifications.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-[var(--neutral-400)] mb-3" />
                <p className="text-sm text-[var(--neutral-600)]">
                    Chưa có thông báo
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Notification items */}
            <div className="divide-y divide-[var(--neutral-200)]">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => onNotificationClick(notification)}
                        isMarking={isMarkingRead === notification.id}
                    />
                ))}
            </div>

            {/* Load more button */}
            {showLoadMoreButton && hasMore && (
                <div className="p-4 border-t border-[var(--neutral-200)]">
                    <Button
                        variant="ghost"
                        className="w-full text-[var(--primary-600)] hover:text-[var(--primary-700)] hover:bg-[var(--primary-50)]"
                        onClick={onLoadMore}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tải...
                            </>
                        ) : (
                            "Xem tất cả"
                        )}
                    </Button>
                </div>
            )}

            {/* Loading indicator for initial load */}
            {isLoading && notifications.length === 0 && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-500)]" />
                </div>
            )}
        </div>
    );
}
