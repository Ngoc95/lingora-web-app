"use client";

import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Word } from "@/types/vocabulary";

interface FlashcardProps {
  word: Word;
  isRevealed: boolean;
  onReveal: () => void;
  onPlayAudio?: () => void;
}

export function Flashcard({
  word,
  isRevealed,
  onReveal,
  onPlayAudio,
}: FlashcardProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleClick = () => {
    setIsFlipping(true);
    onReveal();
  };

  // Play audio when card is revealed (flipped to back)
  useEffect(() => {
    if (isRevealed && word.audioUrl) {
      const timer = setTimeout(() => {
        const audio = new Audio(word.audioUrl!);
        audio.play().catch(console.error);
      }, 300); // Wait for flip animation
      return () => clearTimeout(timer);
    }
  }, [isRevealed, word.audioUrl, word.id]);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(console.error);
    }
  };

  return (
    <div
      className="perspective-1000 w-full max-w-md mx-auto cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative w-full min-h-[400px] transition-transform duration-500 transform-style-preserve-3d",
          isRevealed && "rotate-y-180"
        )}
        onTransitionEnd={() => setIsFlipping(false)}
      >
        {/* Front Side */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden rounded-2xl bg-white shadow-xl border border-[var(--neutral-200)] p-6 flex flex-col items-center justify-center",
            isFlipping && "pointer-events-none"
          )}
        >
          {/* Image */}
          {word.imageUrl && (
            <div className="w-32 h-32 rounded-xl overflow-hidden mb-6 bg-[var(--neutral-100)]">
              <img
                src={word.imageUrl}
                alt={word.word}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Word */}
          <h2 className="text-4xl font-bold text-[var(--neutral-900)] text-center">
            {word.word}
          </h2>

          {/* Phonetic with Audio */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handlePlayAudio}
              className="p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors"
              disabled={!word.audioUrl}
            >
              <Volume2
                className={cn(
                  "w-6 h-6",
                  word.audioUrl ? "text-[var(--primary-500)]" : "text-[var(--neutral-400)]"
                )}
              />
            </button>
            {word.phonetic && (
              <span className="text-lg text-[var(--neutral-600)]">
                {word.phonetic}
              </span>
            )}
          </div>

          {/* Word Type */}
          {word.type && (
            <span className="mt-3 px-3 py-1 rounded-full text-sm bg-[var(--neutral-100)] text-[var(--neutral-600)]">
              {word.type}
            </span>
          )}

          {/* Hint */}
          <p className="mt-6 text-sm text-[var(--neutral-400)]">
            Nhấn để xem nghĩa
          </p>
        </div>

        {/* Back Side */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white shadow-xl border border-[var(--neutral-200)] p-6 flex flex-col items-center justify-center",
            isFlipping && "pointer-events-none"
          )}
        >
          {/* Vietnamese Meaning */}
          <h3 className="text-2xl font-bold text-[var(--primary-500)] text-center mb-2">
            {word.vnMeaning || word.meaning}
          </h3>

          {/* English Meaning (if different from vnMeaning) */}
          {word.meaning && word.vnMeaning && (
            <p className="text-base text-[var(--neutral-600)] text-center mb-4">
              {word.meaning}
            </p>
          )}

          {/* Example */}
          {word.example && (
            <div className="w-full mt-4 p-4 rounded-xl bg-[var(--neutral-50)] border border-[var(--neutral-200)]">
              <p className="text-base text-[var(--neutral-900)] italic">
                &ldquo;{word.example}&rdquo;
              </p>
              {word.exampleTranslation && (
                <p className="mt-2 text-sm text-[var(--neutral-600)]">
                  {word.exampleTranslation}
                </p>
              )}
            </div>
          )}

          {/* Audio on Back */}
          <div className="flex items-center gap-2 mt-6">
            <button
              type="button"
              onClick={handlePlayAudio}
              className="p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors"
              disabled={!word.audioUrl}
            >
              <Volume2
                className={cn(
                  "w-6 h-6",
                  word.audioUrl ? "text-[var(--primary-500)]" : "text-[var(--neutral-400)]"
                )}
              />
            </button>
            {word.phonetic && (
              <span className="text-lg text-[var(--neutral-600)]">
                {word.phonetic}
              </span>
            )}
          </div>
        </div>
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
