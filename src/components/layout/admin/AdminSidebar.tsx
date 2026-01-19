"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  BookOpen,
  Languages,
  FileText,
  Flag,
  Wallet,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Quản lý người dùng",
    icon: Users,
  },
  {
    href: "#content",
    label: "Quản lý nội dung",
    icon: FolderTree,
    children: [
      {
        href: "/admin/categories",
        label: "Danh mục",
        icon: FolderTree,
      },
      {
        href: "/admin/topics",
        label: "Chủ đề",
        icon: BookOpen,
      },
      {
        href: "/admin/words",
        label: "Từ vựng",
        icon: Languages,
      },
    ],
  },
  {
    href: "/admin/exams",
    label: "Quản lý đề thi",
    icon: FileText,
  },
  {
    href: "/admin/reports",
    label: "Quản lý vi phạm",
    icon: Flag,
  },
  {
    href: "/admin/withdrawals",
    label: "Rút tiền",
    icon: Wallet,
  },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["#content"]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const active = isActive(item.href);
    const Icon = item.icon;

    const content = (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-[var(--primary-500)]/10 text-[var(--primary-500)]"
            : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-900)]",
          depth > 0 && "ml-4",
          collapsed && depth === 0 && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active && "text-[var(--primary-500)]")} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </>
        )}
      </div>
    );

    if (collapsed && depth === 0) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {hasChildren ? (
                <button onClick={() => toggleExpand(item.href)} className="w-full">
                  {content}
                </button>
              ) : (
                <Link href={item.href}>{content}</Link>
              )}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (hasChildren) {
      return (
        <div key={item.href}>
          <button
            onClick={() => toggleExpand(item.href)}
            className="w-full"
          >
            {content}
          </button>
          {isExpanded && !collapsed && (
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        {content}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-[var(--neutral-200)] bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-[var(--neutral-200)] px-4",
          collapsed && "justify-center px-2"
        )}>
          <Logo collapsed={collapsed} />
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => renderNavItem(item))}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Toggle Button */}
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full justify-center text-[var(--neutral-600)] hover:text-[var(--neutral-900)]",
              !collapsed && "justify-start"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="mr-2 h-5 w-5" />
                <span>Thu gọn</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
