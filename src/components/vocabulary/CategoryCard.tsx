"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { CategoryProgress } from "@/types/vocabulary";

interface CategoryCardProps {
  category: CategoryProgress;
  href: string;
}

export function CategoryCard({ category, href }: CategoryCardProps) {
  const {
    name,
    description,
    totalTopics,
    completedTopics,
    progressPercent,
  } = category;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-[var(--neutral-200)] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[var(--primary-500)] hover:shadow-md dark:border-[var(--neutral-200)] dark:bg-[var(--card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--neutral-900)] group-hover:text-[var(--primary-500)] transition-colors truncate">
            {name}
          </h3>
          <p className="mt-1 text-sm text-[var(--neutral-600)] line-clamp-2">
            {description}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-[var(--neutral-400)] group-hover:text-[var(--primary-500)] transition-colors" />
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <Progress
          value={progressPercent}
          className="h-2 bg-[var(--neutral-100)]"
        />
      </div>

      {/* Stats */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--neutral-600)]">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2.5 py-1">
          📚 {totalTopics} chủ đề
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2.5 py-1">
          📊 {progressPercent.toFixed(1)}%
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2.5 py-1">
          ✅ {completedTopics}/{totalTopics} hoàn thành
        </span>
      </div>
    </Link>
  );
}
