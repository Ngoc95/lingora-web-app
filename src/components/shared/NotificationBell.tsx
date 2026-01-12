"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications({ autoConnect: true });

  return (
    <NotificationDropdown>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative text-[var(--neutral-600)] hover:text-[var(--primary-500)] hover:bg-[var(--neutral-100)]",
          className
        )}
        title={`Thông báo${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--error)] px-1 text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Thông báo</span>
      </Button>
    </NotificationDropdown>
  );
}
