// ============================================================
// Vocabulary Module Types
// Based on docs/Vocabulary_Learn_Module.md v2.0
// ============================================================

import type { ApiResponse, PaginationParams, PaginationMeta } from "./api";

// === Enums ===

export enum GameType {
  LISTEN_FILL = "LISTEN_FILL",
  LISTEN_CHOOSE = "LISTEN_CHOOSE",
  TRUE_FALSE = "TRUE_FALSE",
  SEE_WORD_CHOOSE_MEANING = "SEE_WORD_CHOOSE_MEANING",
  SEE_MEANING_CHOOSE_WORD = "SEE_MEANING_CHOOSE_WORD",
  PRONUNCIATION = "PRONUNCIATION",
}

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  [GameType.LISTEN_FILL]: "Nghe điền từ",
  [GameType.LISTEN_CHOOSE]: "Nghe chọn từ",
  [GameType.TRUE_FALSE]: "Đúng/Sai",
  [GameType.SEE_WORD_CHOOSE_MEANING]: "Nhìn từ chọn nghĩa",
  [GameType.SEE_MEANING_CHOOSE_WORD]: "Nhìn nghĩa chọn từ",
  [GameType.PRONUNCIATION]: "Luyện phát âm",
};

export enum WordStatus {
  NEW = "NEW",
  LEARNING = "LEARNING",
  REVIEWING = "REVIEWING",
  MASTERED = "MASTERED",
  FORGOTTEN = "FORGOTTEN",
}

export type LearningPhase = "LEARN" | "QUIZ";

// === Domain Models ===

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface CategoryProgress {
  id: number;
  name: string;
  description: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  completed: boolean;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface TopicProgress {
  id: number;
  name: string;
  description: string;
  totalWords: number;
  learnedWords: number;
  completed: boolean;
}

export interface Word {
  id: number;
  topicId: number;
  word: string;
  phonetic: string | null;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  type: string | null;
  meaning: string | null;
  vnMeaning: string | null;
  example: string | null;
  exampleTranslation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
}

export interface WordProgress {
  id: number;
  status: WordStatus;
  srsLevel: number;
  learnedAt: string | null;
  nextReviewDay: string | null;
  wrongCount: number;
  reviewedDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WordWithProgress extends Word {
  progress: WordProgress | null;
}

export interface QuizQuestion {
  type: GameType;
  question: string;
  correctAnswer: string;
  options: string[];
  word: Word;
  attemptCount: number;
}

// === State Interfaces ===

export interface LearningState {
  phase: LearningPhase;
  currentWordIndex: number;
  isFlashcardRevealed: boolean;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  typedAnswer: string;
  isAnswerChecked: boolean;
  correctAnswers: number;
  showCompletionDialog: boolean;
  showExitDialog: boolean;
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface VocabularyCategoriesUiState {
  categories: CategoryProgress[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
  searchQuery: string;
}

export interface CategoryDetailUiState {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  completed: boolean;
  topics: TopicProgress[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  sortQuery: string;
}

export interface TopicDetailUiState {
  topicId: number;
  totalWordsAll: number;
  learnedCountAll: number;
  masteredWordsCount: number;
  progressPercent: number;
  completed: boolean;
  words: WordWithProgress[];
  studyWords: Word[];
  isLoading: boolean;
  isLoadingStudyWords: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalWordsFiltered: number;
  searchQuery: string;
  hasLearnedFilter: boolean | null;
  selectedWordCount: number;
  selectedGameTypes: Set<GameType>;
}

// === API Response Types ===


export interface ProgressSummaryMetaData {
  totalLearnedWord: number | null;
  statistics: Array<{
    srsLevel: number;
    wordCount: number;
  }> | null;
}

export interface CategoryProgressListMetaData extends PaginationMeta {
  categories: CategoryProgress[];
}

export interface CategoryTopicProgressMetaData extends PaginationMeta {
  categoryId: number;
  name: string;
  description: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  completed: boolean;
  topics: TopicProgress[];
}

export interface TopicWordProgressMetaData extends PaginationMeta {
  topicId: number;
  totalWordsAll: number;
  learnedCountAll: number;
  completed: boolean;
  progressPercent: number;
  totalWordsFiltered: number;
  words: WordWithProgress[];
}

export interface StudyWordsMetaData {
  topicId: number;
  total: number;
  words: Word[];
}

export interface ReviewWordsMetaData {
  page: number;
  limit: number;
  total: number;
  words: Word[];
}

export interface CreateWordProgressMetaData {
  userId: number;
  totalCreated: number;
  wordProgresses: Array<{
    id: number;
    word: Word | null;
    status: WordStatus;
    srsLevel: number;
    learnedAt: string | null;
    nextReviewDay: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }>;
}

export interface UpdateWordProgressMetaData {
  userId: number;
  totalUpdated: number;
  wordProgresses: WordProgress[];
}

// === API Request Types ===

export interface CategoryTopicsParams extends PaginationParams {
  sort?: string;
}

export interface TopicWordsParams extends PaginationParams {
  hasLearned?: boolean | null;
}

export interface CreateWordProgressRequest {
  wordIds: number[];
}

export interface UpdateWordProgressRequest {
  wordProgress: Array<{
    wordId: number;
    wrongCount: number;
    reviewedDate: string;
  }>;
}
