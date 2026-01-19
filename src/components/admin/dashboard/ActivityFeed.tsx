import { format } from "date-fns";
import { useState } from "react";
import type { RecentActivity } from "@/types/dashboard";

interface ActivityFeedProps {
    activities: RecentActivity[];
    isLoading?: boolean;
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg bg-[var(--neutral-50)] p-3 animate-pulse"
                    >
                        <div className="h-10 w-10 rounded-full bg-[var(--neutral-200)]" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[var(--neutral-200)] rounded w-3/4" />
                            <div className="h-3 bg-[var(--neutral-200)] rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-[var(--neutral-500)]">
                <p>Chưa có hoạt động nào</p>
            </div>
        );
    }

    const getActivityIcon = (type: RecentActivity["type"]) => {
        switch (type) {
            case "USER_REGISTER":
                return "👤";
            case "PURCHASE":
                return "🛒";
            case "EXAM_COMPLETED":
                return "✅";
            default:
                return "📌";
        }
    };

    const formatDateTime = (date: string | Date) => {
        return format(new Date(date), "HH:mm dd/MM/yyyy");
    };

    const handleImageError = (index: number) => {
        setImageErrors(prev => new Set(prev).add(index));
    };

    const shouldShowImage = (activity: RecentActivity, index: number) => {
        return activity.user.avatar &&
            activity.user.avatar.trim() !== "" &&
            activity.user.avatar.trim() !== "n/a" &&
            !imageErrors.has(index);
    };

    return (
        <div className="space-y-3">
            {activities.map((activity, index) => (
                <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-[var(--neutral-50)] p-3 hover:bg-[var(--neutral-100)] transition-colors"
                >
                    <div className="relative flex-shrink-0">
                        {shouldShowImage(activity, index) ? (
                            <img
                                src={activity.user.avatar}
                                alt={activity.user.username}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={() => handleImageError(index)}
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-semibold text-sm">
                                {activity.user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--neutral-900)]">
                            <span className="font-semibold">{activity.user.username}</span>{" "}
                            {activity.action}
                        </p>
                        <p className="text-xs text-[var(--neutral-600)] mt-0.5">
                            {formatDateTime(activity.timestamp)}
                        </p>
                        {activity.details?.amount && (
                            <p className="text-xs text-[var(--primary-600)] font-semibold mt-1">
                                {activity.details.amount.toLocaleString("vi-VN")} VNĐ
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
