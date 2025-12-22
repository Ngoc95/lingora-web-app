"use client";

import { useState, useCallback } from "react";

interface IFlashcard {
  id?: number;
  frontText: string;
  backText: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
}

interface UseFlashcardOptions {
  cards: IFlashcard[];
  onComplete?: () => void;
}

interface UseFlashcardReturn {
  currentCard: IFlashcard | null;
  currentIndex: number;
  isFlipped: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  flip: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  reset: () => void;
}

export function useFlashcard(options: UseFlashcardOptions): UseFlashcardReturn {
  const { cards, onComplete } = options;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards.length > 0 ? cards[currentIndex] : null;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Reached the end
      onComplete?.();
    }
  }, [currentIndex, cards.length, onComplete]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < cards.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [cards.length]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const progress = {
    current: currentIndex + 1,
    total: cards.length,
    percentage: cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0,
  };

  return {
    currentCard,
    currentIndex,
    isFlipped,
    progress,
    flip,
    next,
    prev,
    goTo,
    reset,
  };
}
