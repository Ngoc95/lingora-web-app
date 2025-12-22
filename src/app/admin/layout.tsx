"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/layout/admin/AdminSidebar";
import { AdminTopBar } from "@/components/layout/admin/AdminTopBar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--neutral-50)]">
      {/* Desktop Sidebar - only render after mount */}
      {mounted && (
        <div className="hidden md:block">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>Menu điều hướng</SheetTitle>
          </VisuallyHidden>
          <AdminSidebar onToggle={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300",
          mounted && sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {/* Top Bar */}
        <AdminTopBar
          sidebarCollapsed={sidebarCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

