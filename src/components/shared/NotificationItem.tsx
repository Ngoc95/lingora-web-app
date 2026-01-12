"use client";

import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";
import {
    Bell,
    Heart,
    MessageCircle,
    ShoppingCart,
    AlertTriangle,
    Trash2,
    Wallet,
    CheckCircle,
    XCircle,
    AlertCircle,
    Lock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface NotificationItemProps {
    notification: Notification;
    onClick?: () => void;
    isMarking?: boolean;
}

// Notification type labels for display
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
    "Change password": "Đổi mật khẩu",
    "Like": "Thích",
    "Comment": "Bình luận",
    "Order": "Đơn hàng",
    "Warning": "Cảnh báo",
    "CONTENT_DELETED": "Nội dung đã bị xóa",
    "Content deleted": "Nội dung đã bị xóa",
    "Withdrawal processing": "Đang xử lý rút tiền",
    "Withdrawal completed": "Rút tiền thành công",
    "Withdrawal rejected": "Rút tiền bị từ chối",
    "Withdrawal failed": "Rút tiền thất bại",
};

// Get icon based on notification type
function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case NotificationType.CHANGE_PASSWORD:
            return Lock;
        case NotificationType.LIKE:
            return Heart;
        case NotificationType.COMMENT:
            return MessageCircle;
        case NotificationType.ORDER:
            return ShoppingCart;
        case NotificationType.WARNING:
            return AlertTriangle;
        case NotificationType.CONTENT_DELETED:
            return Trash2;
        case NotificationType.WITHDRAWAL_PROCESSING:
            return Wallet;
        case NotificationType.WITHDRAWAL_COMPLETED:
            return CheckCircle;
        case NotificationType.WITHDRAWAL_REJECTED:
            return XCircle;
        case NotificationType.WITHDRAWAL_FAILED:
            return AlertCircle;
        default:
            return Bell;
    }
}

// Get icon color based on notification type
function getIconColor(type: NotificationType, isRead: boolean) {
    if (isRead) return "text-[var(--neutral-500)]";

    switch (type) {
        case NotificationType.LIKE:
            return "text-red-500";
        case NotificationType.COMMENT:
            return "text-blue-500";
        case NotificationType.ORDER:
            return "text-green-500";
        case NotificationType.WARNING:
        case NotificationType.CONTENT_DELETED:
            return "text-orange-500";
        case NotificationType.WITHDRAWAL_COMPLETED:
            return "text-green-500";
        case NotificationType.WITHDRAWAL_REJECTED:
        case NotificationType.WITHDRAWAL_FAILED:
            return "text-red-500";
        default:
            return "text-[var(--primary-500)]";
    }
}

// Format message to Vietnamese
function formatMessage(message: string | null): string {
    if (!message) return "";

    return message
        .replace(/POST/g, "bài viết")
        .replace(/STUDY_SET/g, "học liệu")
        .replace(/COMMENT/g, "bình luận")
        .replace(/Post/g, "Bài viết")
        .replace(/Study set/g, "Học liệu")
        .replace(/Comment/g, "Bình luận");
}

export function NotificationItem({
    notification,
    onClick,
    isMarking = false,
}: NotificationItemProps) {
    const Icon = getNotificationIcon(notification.type);
    const iconColor = getIconColor(notification.type, notification.isRead);

    // Format timestamp
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: vi,
    });

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-[var(--neutral-50)]",
                !notification.isRead && "bg-[var(--primary-50)]/30",
                isMarking && "opacity-50 pointer-events-none"
            )}
            onClick={() => {
                console.log("NotificationItem clicked!");
                onClick?.();
            }}
        >
            {/* Icon */}
            <div
                className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    !notification.isRead
                        ? "bg-[var(--primary-100)]"
                        : "bg-[var(--neutral-100)]"
                )}
            >
                <Icon className={cn("w-5 h-5", iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Title with unread indicator */}
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--neutral-900)]">
                        {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
                    </p>
                    {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[var(--primary-500)]" />
                    )}
                </div>

                {/* Message */}
                {notification.message && (
                    <p className="text-sm text-[var(--neutral-600)] line-clamp-2 mb-1">
                        {formatMessage(notification.message)}
                    </p>
                )}

                {/* Timestamp */}
                <p className="text-xs text-[var(--neutral-500)]">{timeAgo}</p>
            </div>

            {/* Loading indicator */}
            {isMarking && (
                <div className="flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
