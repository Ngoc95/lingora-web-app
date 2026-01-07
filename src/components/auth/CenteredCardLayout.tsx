"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CenteredCardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  className?: string;
}

export function CenteredCardLayout({
  children,
  title,
  subtitle,
  showBackLink = true,
  backLinkHref = "/get-started",
  backLinkText = "Quay lại đăng nhập",
  className,
}: CenteredCardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--neutral-50)] to-[var(--neutral-100)] flex items-center justify-center p-4">
      <div
        className={cn(
          "w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10",
          className
        )}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center">
            <img src="/applogo.svg" alt="Lingora" className="w-full h-full" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--neutral-900)] mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--neutral-600)] text-sm">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        {children}

        {/* Back Link */}
        {showBackLink && (
          <div className="mt-6 text-center">
            <Link
              href={backLinkHref}
              className="inline-flex items-center gap-2 text-sm text-[var(--neutral-600)] hover:text-[var(--primary-500)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLinkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
