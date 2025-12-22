"use client";

import { useState, useCallback } from "react";

interface ExamAnswer {
  questionId: string;
  answer: string | string[] | null;
  timestamp: number;
}

interface UseExamSessionReturn {
  answers: Record<string, ExamAnswer>;
  markedForReview: Set<string>;
  currentQuestionIndex: number;
  setAnswer: (questionId: string, answer: string | string[] | null) => void;
  toggleMarkForReview: (questionId: string) => void;
  isMarkedForReview: (questionId: string) => boolean;
  getAnswer: (questionId: string) => string | string[] | null;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  getProgress: () => { answered: number; total: number; percentage: number };
  submitSection: () => Record<string, ExamAnswer>;
  reset: () => void;
}

export function useExamSession(totalQuestions: number): UseExamSessionReturn {
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const setAnswer = useCallback((questionId: string, answer: string | string[] | null) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const toggleMarkForReview = useCallback((questionId: string) => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const isMarkedForReview = useCallback(
    (questionId: string) => markedForReview.has(questionId),
    [markedForReview]
  );

  const getAnswer = useCallback(
    (questionId: string) => answers[questionId]?.answer ?? null,
    [answers]
  );

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
      }
    },
    [totalQuestions]
  );

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev < totalQuestions - 1 ? prev + 1 : prev
    );
  }, [totalQuestions]);

  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const getProgress = useCallback(() => {
    const answered = Object.keys(answers).length;
    return {
      answered,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0,
    };
  }, [answers, totalQuestions]);

  const submitSection = useCallback(() => {
    return { ...answers };
  }, [answers]);

  const reset = useCallback(() => {
    setAnswers({});
    setMarkedForReview(new Set());
    setCurrentQuestionIndex(0);
  }, []);

  return {
    answers,
    markedForReview,
    currentQuestionIndex,
    setAnswer,
    toggleMarkForReview,
    isMarkedForReview,
    getAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    getProgress,
    submitSection,
    reset,
  };
}
