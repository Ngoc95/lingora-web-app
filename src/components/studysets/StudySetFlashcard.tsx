"use client";

import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlashcardSession } from "@/hooks/useStudySet";
import type { Flashcard } from "@/types/studySet";

interface StudySetFlashcardProps {
  flashcards: Flashcard[];
  onExit: () => void;
  onComplete?: () => void;
}

export function StudySetFlashcard({
  flashcards,
  onExit,
  onComplete,
}: StudySetFlashcardProps) {
  const {
    currentCard,
    currentIndex,
    isFlipped,
    isFirst,
    isLast,
    progress,
    flip,
    next,
    prev,
    reset,
  } = useFlashcardSession(flashcards);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          flip();
          break;
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
          next();
          break;
        case "Escape":
          onExit();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flip, next, prev, onExit]);

  // Handle complete
  useEffect(() => {
    if (isLast && isFlipped && onComplete) {
      // User has seen the last card
    }
  }, [isLast, isFlipped, onComplete]);

  const handlePlayAudio = useCallback(() => {
    if (currentCard?.audioUrl) {
      const audio = new Audio(currentCard.audioUrl);
      audio.play().catch(console.error);
    }
  }, [currentCard?.audioUrl]);

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--neutral-600)]">Không có flashcard nào</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neutral-200)]">
        <button
          onClick={onExit}
          className="p-2 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-600)]"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-medium text-[var(--neutral-900)]">
          {progress.current} / {progress.total}
        </span>
        <button
          onClick={reset}
          className="p-2 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-600)]"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--neutral-100)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div
          className="perspective-1000 w-full max-w-lg cursor-pointer"
          onClick={flip}
        >
          <div
            className={cn(
              "relative w-full min-h-[350px] md:min-h-[400px] transition-transform duration-500 transform-style-preserve-3d",
              isFlipped && "rotate-y-180"
            )}
          >
            {/* Front Side */}
            <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] shadow-xl p-6 flex flex-col items-center justify-center">
              {/* Image */}
              {currentCard.imageUrl && (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden mb-4 bg-white/10">
                  <img
                    src={currentCard.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Front Text */}
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                {currentCard.frontText}
              </h2>

              {/* Audio button */}
              {currentCard.audioUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio();
                  }}
                  className="mt-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              )}

              <p className="mt-6 text-sm text-white/70">Nhấn để xem nghĩa</p>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white shadow-xl border border-[var(--neutral-200)] p-6 flex flex-col items-center justify-center">
              {/* Back Text */}
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--primary-500)] text-center mb-2">
                {currentCard.backText}
              </h3>

              {/* Example */}
              {currentCard.example && (
                <div className="w-full mt-4 p-4 rounded-xl bg-[var(--neutral-50)] border border-[var(--neutral-200)]">
                  <p className="text-base text-[var(--neutral-700)] italic text-center">
                    "{currentCard.example}"
                  </p>
                </div>
              )}

              <p className="mt-6 text-sm text-[var(--neutral-400)]">
                Nhấn để lật lại
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-[var(--neutral-200)]">
        <button
          onClick={prev}
          disabled={isFirst}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors",
            isFirst
              ? "text-[var(--neutral-300)] cursor-not-allowed"
              : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Dots (show on tablet+) */}
        <div className="hidden md:flex items-center gap-1.5">
          {flashcards.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                idx === currentIndex
                  ? "bg-[var(--primary-500)]"
                  : "bg-[var(--neutral-300)]"
              )}
            />
          ))}
          {flashcards.length > 10 && (
            <span className="text-xs text-[var(--neutral-400)]">...</span>
          )}
        </div>

        {isLast ? (
          <button
            onClick={onComplete}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-colors"
          >
            <span>Hoàn thành</span>
          </button>
        ) : (
          <button
            onClick={next}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-[var(--neutral-600)] hover:bg-[var(--neutral-100)] transition-colors"
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CSS for 3D flip */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
