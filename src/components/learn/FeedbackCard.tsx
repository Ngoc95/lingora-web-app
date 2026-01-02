"use client";

import { Check, X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Word } from "@/types/vocabulary";

interface FeedbackCardProps {
  isCorrect: boolean;
  word: Word;
  onContinue: () => void;
}

export function FeedbackCard({ isCorrect, word, onContinue }: FeedbackCardProps) {
  const handlePlayAudio = () => {
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(console.error);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 transition-transform duration-300",
        "bg-white border-t shadow-lg",
        isCorrect ? "border-[var(--success)]" : "border-[var(--error)]"
      )}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isCorrect ? "bg-[var(--success)]" : "bg-[var(--error)]"
            )}
          >
            {isCorrect ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <X className="w-5 h-5 text-white" />
            )}
          </div>
          <span
            className={cn(
              "text-lg font-semibold",
              isCorrect ? "text-[var(--success)]" : "text-[var(--error)]"
            )}
          >
            {isCorrect ? "Chính xác!" : "Sai rồi!"}
          </span>
        </div>

        {/* Word Info */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors"
            disabled={!word.audioUrl}
          >
            <Volume2
              className={cn(
                "w-5 h-5",
                word.audioUrl ? "text-[var(--primary-500)]" : "text-[var(--neutral-400)]"
              )}
            />
          </button>
          <div>
            <span className="font-semibold text-[var(--neutral-900)]">
              {word.word}
            </span>
            {word.phonetic && (
              <span className="ml-2 text-[var(--neutral-600)]">
                {word.phonetic}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-[var(--neutral-600)] mb-4">
          {word.vnMeaning || word.meaning}
        </p>

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all duration-200",
            isCorrect
              ? "bg-[var(--success)] text-white hover:bg-[var(--success)]/90"
              : "bg-[var(--error)] text-white hover:bg-[var(--error)]/90"
          )}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
