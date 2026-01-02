"use client";

import { cn } from "@/lib/utils";

interface WordCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  maxAvailable?: number;
}

const WORD_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30];

export function WordCountSelector({
  value,
  onChange,
  maxAvailable,
}: WordCountSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--neutral-900)] uppercase tracking-wide">
        Số từ học
      </label>
      <div className="flex flex-wrap gap-2">
        {WORD_COUNT_OPTIONS.map((count) => {
          const isDisabled = maxAvailable !== undefined && count > maxAvailable;
          const isSelected = value === count;

          return (
            <button
              key={count}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(count)}
              className={cn(
                "min-w-[3.5rem] px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
                "border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2",
                isSelected
                  ? "border-[var(--primary-500)] bg-[var(--primary-500)] text-white"
                  : "border-[var(--neutral-200)] bg-white text-[var(--neutral-900)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-500)]/5",
                isDisabled && "opacity-50 cursor-not-allowed hover:border-[var(--neutral-200)] hover:bg-white"
              )}
            >
              {count}
            </button>
          );
        })}
      </div>
      {maxAvailable !== undefined && maxAvailable < 30 && (
        <p className="text-xs text-[var(--neutral-600)]">
          Có {maxAvailable} từ chưa học trong chủ đề này
        </p>
      )}
    </div>
  );
}
