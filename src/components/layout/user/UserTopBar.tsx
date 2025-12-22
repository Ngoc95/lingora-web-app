"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Library,
  BookA,
  MessageCircle,
  User,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserMenu } from "@/components/shared/UserMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/vocabulary",
    label: "Từ vựng",
    icon: BookOpen,
  },
  {
    href: "/practice",
    label: "Luyện tập",
    icon: GraduationCap,
  },
  {
    href: "/study-sets",
    label: "Học liệu",
    icon: Library,
  },
  {
    href: "/dictionary",
    label: "Từ điển",
    icon: BookA,
  },
  {
    href: "/forum",
    label: "Diễn đàn",
    icon: MessageCircle,
  },
  {
    href: "/profile",
    label: "Cá nhân",
    icon: User,
  },
];

interface UserTopBarProps {
  title?: string;
}

export function UserTopBar({ title }: UserTopBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--neutral-200)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 lg:px-6">
        {/* Left: Logo + Nav (Desktop) */}
        <div className="flex items-center gap-6">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary-500)]/10 text-[var(--primary-500)]"
                      : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-900)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Title (optional) - only on desktop */}
        {title && (
          <h1 className="hidden text-lg font-semibold text-[var(--neutral-900)] lg:block">
            {title}
          </h1>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell count={3} />
          <UserMenu 
            user={{
              name: "Người dùng",
              email: "user@lingora.com",
            }}
          />
          
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[var(--neutral-600)]"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[var(--neutral-200)]">
                  <Logo />
                </div>
                <nav className="flex-1 p-4">
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[var(--primary-500)]/10 text-[var(--primary-500)]"
                              : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-900)]"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
