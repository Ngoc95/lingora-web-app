"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  count?: number;
  className?: string;
  onClick?: () => void;
}

export function NotificationBell({ count = 0, className, onClick }: NotificationBellProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative text-[var(--neutral-600)] hover:text-[var(--primary-500)] hover:bg-[var(--neutral-100)]",
              className
            )}
            onClick={onClick}
          >
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--error)] px-1 text-xs font-medium text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
            <span className="sr-only">Thông báo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Thông báo {count > 0 && `(${count})`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
