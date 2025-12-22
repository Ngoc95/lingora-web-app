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
} from "lucide-react";
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

export function UserBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--neutral-200)] bg-white md:hidden">
      <div className="grid h-16 grid-cols-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive
                  ? "text-[var(--primary-500)]"
                  : "text-[var(--neutral-600)] hover:text-[var(--primary-500)]"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--primary-500)]" />
                )}
              </div>
              <span className={cn("font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
