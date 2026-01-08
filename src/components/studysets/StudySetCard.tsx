"use client";

import { BookOpen, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudySet } from "@/types/studySet";

interface StudySetCardProps {
  studySet: StudySet;
  onClick?: () => void;
  className?: string;
}

export function StudySetCard({ studySet, onClick, className }: StudySetCardProps) {
  const isFree = Math.floor(studySet.price) === 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl p-5 shadow-sm border border-[var(--neutral-200)]",
        "hover:shadow-lg hover:border-[var(--primary-500)]/30 transition-all duration-300",
        "cursor-pointer group",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white flex-shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--neutral-900)] group-hover:text-[var(--primary-500)] transition-colors line-clamp-1 text-base">
            {studySet.title}
          </h3>
          <p className="text-sm text-[var(--neutral-600)]">
            by @{studySet.owner.username}
          </p>
        </div>
      </div>

      {/* Description */}
      {studySet.description && (
        <p className="text-sm text-[var(--neutral-600)] mb-3 line-clamp-2">
          {studySet.description}
        </p>
      )}

      {/* Stats Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
          {studySet.totalFlashcards} thẻ
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--info)]/10 text-[var(--info)]">
          {studySet.totalQuizzes} câu hỏi
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--neutral-100)]">
        <div className="flex items-center gap-3 text-[var(--neutral-600)]">
          <span className="flex items-center gap-1">
            <Heart
              className={cn(
                "w-4 h-4",
                studySet.isAlreadyLike && "fill-[var(--error)] text-[var(--error)]"
              )}
            />
            {studySet.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {studySet.commentCount}
          </span>
        </div>
        <span
          className={cn(
            "font-semibold",
            isFree ? "text-[var(--success)]" : "text-[var(--primary-500)]"
          )}
        >
          {isFree ? "Miễn phí" : `${Math.floor(studySet.price).toLocaleString("vi-VN")}đ`}
        </span>
      </div>
    </div>
  );
}
