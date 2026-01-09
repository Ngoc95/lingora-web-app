"use client";

// ============================================================
// StudySet Hooks - Data Fetching & State Management
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { studySetService } from '@/services/studySet.service';
import type {
  StudySet,
  StudySetListResponse,
  StudySetQueryParams,
  CreateStudySetData,
  UpdateStudySetData,
  FlashcardFormData,
  QuizFormData,
  Quiz,
  QuizType,
  QuizSessionState,
} from '@/types/studySet';
import { parseCorrectAnswers, joinCorrectAnswers, checkQuizAnswer } from '@/types/studySet';

// ============================================================
// Study Set List Hook
// ============================================================

type StudySetTab = 'all' | 'my' | 'purchased';

interface UseStudySetListOptions {
  tab?: StudySetTab;
  initialParams?: StudySetQueryParams;
}

export function useStudySetList(options: UseStudySetListOptions = {}) {
  const { tab = 'all', initialParams = {} } = options;
  const [params, setParams] = useState<StudySetQueryParams>({
    page: 1,
    limit: 12,
    ...initialParams,
  });

  const fetcher = useCallback(async () => {
    if (tab === 'my') {
      const response = await studySetService.getOwn(params);
      return response.metaData;
    }
    const response = await studySetService.getAll(params);
    return response.metaData;
  }, [tab, params]);

  const { data, error, isLoading, mutate: revalidate } = useSWR<StudySetListResponse>(
    ['studysets', tab, params],
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setPriceRange = useCallback((minPrice?: number, maxPrice?: number) => {
    setParams((prev) => ({ ...prev, minPrice, maxPrice, page: 1 }));
  }, []);

  const setSort = useCallback((sort: string) => {
    setParams((prev) => ({ ...prev, sort }));
  }, []);

  // Filter for purchased tab (client-side since API returns isPurchased flag)
  const filteredStudySets = useMemo(() => {
    if (!data?.studySets) return [];
    if (tab === 'purchased') {
      return data.studySets.filter((ss) => ss.isPurchased);
    }
    return data.studySets;
  }, [data?.studySets, tab]);

  return {
    studySets: filteredStudySets,
    total: data?.total ?? 0,
    currentPage: data?.currentPage ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    params,
    setSearch,
    setPage,
    setPriceRange,
    setSort,
    revalidate,
  };
}

// ============================================================
// Study Set Detail Hook
// ============================================================

export function useStudySetDetail(id: number | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<StudySet>(
    id ? ['studyset', id] : null,
    async () => {
      if (!id) throw new Error('No ID');
      const response = await studySetService.getById(id);
      return response.metaData;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    studySet: data,
    isLoading,
    error,
    revalidate,
  };
}

// ============================================================
// Create/Update Study Set Hook
// ============================================================

interface UseStudySetMutationResult {
  isLoading: boolean;
  error: string | null;
  create: (
    data: CreateStudySetData,
    pendingImages: Map<number, File>
  ) => Promise<StudySet | null>;
  update: (
    id: number,
    data: UpdateStudySetData,
    pendingImages: Map<number, File>
  ) => Promise<StudySet | null>;
  remove: (id: number) => Promise<boolean>;
  purchase: (id: number) => Promise<{ paymentUrl?: string | null; isFree: boolean } | null>;
}

export function useStudySetMutation(): UseStudySetMutationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload pending images and return flashcards with imageUrls
   */
  const uploadPendingImages = useCallback(
    async (
      flashcards: CreateStudySetData['flashcards'],
      pendingImages: Map<number, File>
    ) => {
      if (!flashcards || pendingImages.size === 0) return flashcards;

      const updatedFlashcards = [...flashcards];

      // Upload images in parallel
      const uploadPromises = Array.from(pendingImages.entries()).map(
        async ([index, file]) => {
          const imageUrl = await studySetService.uploadImage(file);
          return { index, imageUrl };
        }
      );

      const results = await Promise.all(uploadPromises);

      // Update flashcards with imageUrls
      results.forEach(({ index, imageUrl }) => {
        if (updatedFlashcards[index]) {
          updatedFlashcards[index] = {
            ...updatedFlashcards[index],
            imageUrl,
          };
        }
      });

      return updatedFlashcards;
    },
    []
  );

  const create = useCallback(
    async (
      data: CreateStudySetData,
      pendingImages: Map<number, File>
    ): Promise<StudySet | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Upload pending images first
        const flashcardsWithImages = await uploadPendingImages(
          data.flashcards,
          pendingImages
        );

        const response = await studySetService.create({
          ...data,
          flashcards: flashcardsWithImages,
        });

        // Revalidate list
        mutate((key) => Array.isArray(key) && key[0] === 'studysets');

        return response.metaData;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create study set';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [uploadPendingImages]
  );

  const update = useCallback(
    async (
      id: number,
      data: UpdateStudySetData,
      pendingImages: Map<number, File>
    ): Promise<StudySet | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Upload pending images first
        const flashcardsWithImages = await uploadPendingImages(
          data.flashcards,
          pendingImages
        );

        const response = await studySetService.update(id, {
          ...data,
          flashcards: flashcardsWithImages,
        });

        // Revalidate
        mutate(['studyset', id]);
        mutate((key) => Array.isArray(key) && key[0] === 'studysets');

        return response.metaData;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update study set';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [uploadPendingImages]
  );

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await studySetService.delete(id);
      mutate((key) => Array.isArray(key) && key[0] === 'studysets');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete study set';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchase = useCallback(
    async (id: number): Promise<{ paymentUrl?: string | null; isFree: boolean } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await studySetService.buy(id);
        const result = response.metaData;
        if (result.isFree) {
          // Revalidate to update isPurchased
          mutate(['studyset', id]);
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to purchase study set';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    create,
    update,
    remove,
    purchase,
  };
}

// ============================================================
// Quiz Session Hook
// ============================================================

export function useQuizSession(quizzes: Quiz[]) {
  const [state, setState] = useState<QuizSessionState>({
    currentIndex: 0,
    selectedAnswers: {},
    checkedAnswers: new Set(),
    correctCount: 0,
    showFeedback: false,
    showResults: false,
  });

  const currentQuiz = quizzes[state.currentIndex] ?? null;
  const isLastQuestion = state.currentIndex === quizzes.length - 1;

  const selectAnswer = useCallback((answer: string) => {
    setState((prev) => {
      const current = prev.selectedAnswers[prev.currentIndex] || [];
      const quiz = quizzes[prev.currentIndex];
      
      // For TRUE_FALSE or SHORT_ANSWER, single selection
      if (quiz?.type !== 'MULTIPLE_CHOICE') {
        return {
          ...prev,
          selectedAnswers: {
            ...prev.selectedAnswers,
            [prev.currentIndex]: [answer],
          },
        };
      }

      // For MULTIPLE_CHOICE, toggle selection
      const isSelected = current.includes(answer);
      const updated = isSelected
        ? current.filter((a) => a !== answer)
        : [...current, answer];

      return {
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [prev.currentIndex]: updated,
        },
      };
    });
  }, [quizzes]);

  const setTypedAnswer = useCallback((answer: string) => {
    setState((prev) => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [prev.currentIndex]: [answer],
      },
    }));
  }, []);

  const checkAnswer = useCallback(() => {
    setState((prev) => {
      const quiz = quizzes[prev.currentIndex];
      const selected = prev.selectedAnswers[prev.currentIndex] || [];
      const isCorrect = checkQuizAnswer(selected, quiz?.correctAnswer || '');

      const newChecked = new Set(prev.checkedAnswers);
      newChecked.add(prev.currentIndex);

      return {
        ...prev,
        checkedAnswers: newChecked,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        showFeedback: true,
      };
    });
  }, [quizzes]);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex === quizzes.length - 1) {
        return { ...prev, showResults: true, showFeedback: false };
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showFeedback: false,
      };
    });
  }, [quizzes.length]);

  const prevQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
      showFeedback: prev.checkedAnswers.has(prev.currentIndex - 1),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentIndex: 0,
      selectedAnswers: {},
      checkedAnswers: new Set(),
      correctCount: 0,
      showFeedback: false,
      showResults: false,
    });
  }, []);

  const selectedForCurrent = state.selectedAnswers[state.currentIndex] || [];
  const isChecked = state.checkedAnswers.has(state.currentIndex);
  const isCorrect = isChecked && currentQuiz 
    ? checkQuizAnswer(selectedForCurrent, currentQuiz.correctAnswer)
    : false;

  return {
    // State
    currentIndex: state.currentIndex,
    currentQuiz,
    selectedAnswers: selectedForCurrent,
    isChecked,
    isCorrect,
    correctCount: state.correctCount,
    totalAnswered: state.checkedAnswers.size,
    showFeedback: state.showFeedback,
    showResults: state.showResults,
    isLastQuestion,
    
    // Progress
    progress: {
      current: state.currentIndex + 1,
      total: quizzes.length,
      percentage: quizzes.length > 0 
        ? ((state.currentIndex + 1) / quizzes.length) * 100 
        : 0,
    },

    // Actions
    selectAnswer,
    setTypedAnswer,
    checkAnswer,
    nextQuestion,
    prevQuestion,
    reset,
  };
}

// ============================================================
// Flashcard Session Hook (reusing existing useFlashcard pattern)
// ============================================================

export function useFlashcardSession(flashcards: { frontText: string; backText: string; example?: string; imageUrl?: string }[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex] ?? null;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < flashcards.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [flashcards.length]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  return {
    currentCard,
    currentIndex,
    isFlipped,
    isFirst: currentIndex === 0,
    isLast: currentIndex === flashcards.length - 1,
    progress: {
      current: currentIndex + 1,
      total: flashcards.length,
      percentage: flashcards.length > 0 
        ? ((currentIndex + 1) / flashcards.length) * 100 
        : 0,
    },
    flip,
    next,
    prev,
    goTo,
    reset,
  };
}
