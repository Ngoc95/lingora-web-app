"use client";

/**
 * Exam Hooks
 * Custom hooks for exam module state management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { examService } from "@/services/exam.service";
import {
  Exam,
  ExamSection,
  ExamAttempt,
  ExamListParams,
  AttemptListParams,
  AnswerPayload,
} from "@/types/exam";
import { uploadService } from "@/services/upload.service";

// ============================================================
// useExamList - Paginated exam list with filters
// ============================================================

interface UseExamListOptions {
  initialParams?: ExamListParams;
}

export function useExamList(options: UseExamListOptions = {}) {
  const { initialParams = {} } = options;

  const [exams, setExams] = useState<Exam[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ExamListParams>({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const fetchExams = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const response = await examService.listExams({
          ...params,
          page: pageNum,
        });
        setExams((prev) =>
          reset ? response.exams : [...prev, ...response.exams]
        );
        setPage(response.currentPage);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load exams");
      } finally {
        setLoading(false);
      }
    },
    [params, loading]
  );

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search }));
    setExams([]);
  }, []);

  const setExamType = useCallback((examType: ExamListParams["examType"]) => {
    setParams((prev) => ({ ...prev, examType }));
    setExams([]);
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchExams(page + 1);
    }
  }, [page, totalPages, loading, fetchExams]);

  const refresh = useCallback(() => {
    setExams([]);
    fetchExams(1, true);
  }, [fetchExams]);

  // Initial load and param changes
  useEffect(() => {
    fetchExams(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.examType, params.search]);

  return {
    exams,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    setSearch,
    setExamType,
    loadMore,
    refresh,
  };
}

// ============================================================
// useAttemptList - Paginated attempt history
// ============================================================

export function useAttemptList() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      try {
        const response = await examService.listAttempts({
          page: pageNum,
          limit: 20,
        });
        setAttempts((prev) =>
          reset ? response.attempts : [...prev, ...response.attempts]
        );
        setPage(response.currentPage);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchAttempts(page + 1);
    }
  }, [page, totalPages, loading, fetchAttempts]);

  const refresh = useCallback(() => {
    setAttempts([]);
    fetchAttempts(1, true);
  }, [fetchAttempts]);

  return {
    attempts,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    loadMore,
    refresh,
    fetchAttempts,
  };
}

// ============================================================
// useExamDetail - Single exam with sections
// ============================================================

export function useExamDetail(examId: number | null) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;

    const loadExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await examService.getExamDetail(examId);
        setExam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  return { exam, loading, error };
}

// ============================================================
// useSectionPractice - Section quiz state management
// ============================================================

interface UserAnswers {
  [questionId: number]: unknown;
}

interface UseSectionPracticeOptions {
  examId: number;
  sectionId: number;
  mode: "section" | "full";
  attemptId?: number | null;
}

export function useSectionPractice(options: UseSectionPracticeOptions) {
  const { examId, sectionId, mode, attemptId } = options;

  const [section, setSection] = useState<ExamSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Answers
  const [answers, setAnswers] = useState<UserAnswers>({});

  // Navigation
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Load section
  useEffect(() => {
    const loadSection = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await examService.getSectionDetail(examId, sectionId);
        setSection(data);
        if (data.durationSeconds) {
          setTimeRemaining(data.durationSeconds);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load section");
      } finally {
        setLoading(false);
      }
    };

    loadSection();
  }, [examId, sectionId]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || loading) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeRemaining]);

  // Get all questions flat
  const allQuestions =
    section?.groups?.flatMap(
      (g) => g.questionGroups?.flatMap((qg) => qg.questions) || []
    ) || [];

  const updateAnswer = useCallback((questionId: number, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const submit = useCallback(async (): Promise<number | null> => {
    if (!section) return null;
    setSubmitting(true);

    try {
      const answerPayloads: AnswerPayload[] = [];

      for (const q of allQuestions) {
        let answer = answers[q.id] ?? "";
        
        // Check if answer is a blob URL (audio recording)
        if (typeof answer === "string" && answer.startsWith("blob:")) {
          try {
            // Convert blob URL to File
            const response = await fetch(answer);
            const blob = await response.blob();
            const file = new File([blob], `audio_${q.id}.webm`, { type: "audio/webm" });
            
            // Upload audio
            const uploadResponse = await uploadService.uploadAudio(file);
            const uploadResult = uploadResponse.metaData;
            if (uploadResult && uploadResult.url) {
              answer = uploadResult.url;
            }
          } catch (err) {
            console.error("Failed to upload audio answer", err);
            // Fallback: keep blob URL (will likely fail on backend but better than crashing)
          }
        }

        answerPayloads.push({
          questionId: q.id,
          answer: answer,
        });
      }

      if (mode === "full" && attemptId) {
        await examService.submitSectionAttempt(attemptId, sectionId, {
          answers: answerPayloads,
        });
        return attemptId;
      } else {
        const attempt = await examService.startExamAttempt(examId, {
          mode: "SECTION",
          sectionId: sectionId,
        });
        await examService.submitSectionAttempt(attempt.id, sectionId, {
          answers: answerPayloads,
        });
        await examService.submitExamAttempt(attempt.id);
        return attempt.id;
      }
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [section, allQuestions, answers, mode, attemptId, examId, sectionId]);

  const nextGroup = useCallback(() => {
    const totalGroups = section?.groups?.length || 0;
    if (currentGroupIndex < totalGroups - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
    }
  }, [currentGroupIndex, section]);

  const prevGroup = useCallback(() => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
    }
  }, [currentGroupIndex]);

  const goToGroup = useCallback((index: number) => {
    setCurrentGroupIndex(index);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    // State
    section,
    loading,
    error,
    submitting,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isTimeUp: timeRemaining <= 0,
    isTimeCritical: timeRemaining < 60,

    // Answers
    answers,
    updateAnswer,
    answeredCount: Object.keys(answers).length,
    totalQuestions: allQuestions.length,

    // Navigation
    currentGroupIndex,
    currentGroup: section?.groups?.[currentGroupIndex] || null,
    totalGroups: section?.groups?.length || 0,
    isFirstGroup: currentGroupIndex === 0,
    isLastGroup: currentGroupIndex === (section?.groups?.length || 1) - 1,
    nextGroup,
    prevGroup,
    goToGroup,

    // Progress
    progress:
      section?.groups?.length
        ? ((currentGroupIndex + 1) / section.groups.length) * 100
        : 0,

    // Actions
    submit,
  };
}

// ============================================================
// useAudioPlayer - Audio playback for listening sections
// ============================================================

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onpause = () => setIsPlaying(false);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.ontimeupdate = () =>
      setCurrentTime(audioRef.current?.currentTime || 0);
    audioRef.current.onloadedmetadata = () =>
      setDuration(audioRef.current?.duration || 0);
    audioRef.current.play().catch(console.error);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    seek,
    cleanup,
  };
}
