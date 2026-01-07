"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { TopicProgress } from "@/types/vocabulary";

interface TopicCardProps {
  topic: TopicProgress;
  href: string;
}

export function TopicCard({ topic, href }: TopicCardProps) {
  const { name, description, totalWords, learnedWords, completed } = topic;
  const progressPercent = totalWords > 0 ? (learnedWords / totalWords) * 100 : 0;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-[var(--neutral-200)] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[var(--primary-500)] hover:shadow-md dark:border-[var(--neutral-200)] dark:bg-[var(--card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--neutral-900)] group-hover:text-[var(--primary-500)] transition-colors truncate">
              {name}
            </h3>
            {completed && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--success)] text-white text-xs">
                ✓
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--neutral-600)] line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[var(--neutral-600)]">Tiến trình</span>
          <span className="font-medium text-[var(--neutral-900)]">
            {learnedWords}/{totalWords} từ
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2 bg-[var(--neutral-100)]"
        />
      </div>
    </Link>
  );
}
