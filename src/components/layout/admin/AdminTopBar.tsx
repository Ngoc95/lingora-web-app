"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserMenu } from "@/components/shared/UserMenu";
import { cn } from "@/lib/utils";

interface AdminTopBarProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
  mobileMenuOpen?: boolean;
}

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function AdminTopBar({ onMenuClick, sidebarCollapsed, mobileMenuOpen }: AdminTopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/get-started");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center border-b border-[var(--neutral-200)] bg-white transition-all duration-300",
      )}
    >
      <div className="flex flex-1 items-center justify-between px-6">
        {/* Left: Menu (mobile) + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-[var(--neutral-600)]"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Title - hidden on mobile when menu is open */}
          <div className={cn(
            "transition-opacity duration-200",
            mobileMenuOpen && "md:opacity-100 opacity-0 pointer-events-none"
          )}>
            <h1 className="text-lg font-semibold text-[var(--neutral-900)]">
              Quản trị viên
            </h1>
            <p className="text-sm text-[var(--neutral-600)]">
              Chào mừng trở lại!
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserMenu
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}

