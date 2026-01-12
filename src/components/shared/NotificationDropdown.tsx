"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "./NotificationList";
import { notificationService } from "@/services/notification.service";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";

interface NotificationDropdownProps {
    children: React.ReactNode;
}

export function NotificationDropdown({ children }: NotificationDropdownProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const {
        notifications,
        isLoading,
        error,
        hasMore,
        loadMore,
        markAsRead,
        isMarkingRead,
    } = useNotifications({
        autoConnect: true,
        limit: 10,
    });

    // Debug: log when popover state changes
    useEffect(() => {
        console.log("Notification dropdown open state:", open);
    }, [open]);

    const handleNotificationClick = async (notification: any) => {
        console.log("Notification clicked:", notification);

        // Mark as read
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        // Get navigation URL
        const url = notificationService.getNavigationUrl(notification);
        console.log("Navigation URL:", url);

        // Close dropdown
        setOpen(false);

        // Navigate if URL exists
        if (url) {
            console.log("Navigating to:", url);
            router.push(url);
        } else {
            console.log("No navigation URL found for notification");
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent
                className="w-[400px] p-0 max-h-[600px] overflow-hidden flex flex-col"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[var(--neutral-200)] bg-white sticky top-0 z-10">
                    <h3 className="font-semibold text-base text-[var(--neutral-900)]">
                        Thông báo
                    </h3>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1">
                    <NotificationList
                        notifications={notifications}
                        onNotificationClick={handleNotificationClick}
                        isMarkingRead={isMarkingRead}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        error={error}
                        onLoadMore={loadMore}
                        showLoadMoreButton={true}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
