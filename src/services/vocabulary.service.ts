// ============================================================
// Vocabulary Service - API Methods
// Based on docs/Vocabulary_Learn_Module.md v2.0
// ============================================================

import { api } from "./api";

export interface Word {
  id: number;
  word: string;
  meaning: string;
  vnMeaning?: string; 
  type: string;
  cefrLevel: string;
  topic?: { id: number; name: string };
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  phonetic?: string;
}

export interface WordListResponse {
  currentPage: number;
  totalPages: number;
  total: number;
  words: Word[];
}

export interface CreateWordRequest {
  word: string;
  meaning: string;
  vnMeaning?: string;
  type: string;
  cefrLevel: string;
  topicId?: number;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  phonetic?: string;
}

export interface UpdateWordRequest {
  word?: string;
  meaning?: string;
  vnMeaning?: string;
  type?: string;
  cefrLevel?: string;
  topicId?: number;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
  phonetic?: string;
}

export interface VocabularyListMetaData {
  currentPage: number;
  totalPages: number;
  total: number;
  words: Word[];
}

import type { ApiResponse, PaginationParams } from "@/types/api";
import type {
  ProgressSummaryMetaData,
  CategoryProgressListMetaData,
  CategoryTopicProgressMetaData,
  TopicWordProgressMetaData,
  StudyWordsMetaData,
  ReviewWordsMetaData,
  CreateWordProgressMetaData,
  UpdateWordProgressMetaData,
  CategoryTopicsParams,
  TopicWordsParams,
  CreateWordProgressRequest,
  UpdateWordProgressRequest,
} from "@/types/vocabulary";

export const vocabularyService = {
  /**
   * Get word statistics summary
   * GET /progress/word-statistics
   */
  getWordStatistics: () =>
    api.get<ApiResponse<ProgressSummaryMetaData>>("/progress/word-statistics"),

  /**
   * Get categories with progress
   * GET /progress/categories
   */
  getCategories: (params?: PaginationParams) =>
    api.get<ApiResponse<CategoryProgressListMetaData>>("/progress/categories", params),

  /**
   * Get topics in a category with progress
   * GET /progress/categories/{categoryId}/topics
   */
  getCategoryTopics: (categoryId: number, params?: CategoryTopicsParams) =>
    api.get<ApiResponse<CategoryTopicProgressMetaData>>(
      `/progress/categories/${categoryId}/topics`,
      params
    ),

  /**
   * Get words in a topic with progress
   * GET /progress/topics/{topicId}/words
   */
  getTopicWords: (topicId: number, params?: TopicWordsParams) =>
    api.get<ApiResponse<TopicWordProgressMetaData>>(
      `/progress/topics/${topicId}/words`,
      params
    ),

  /**
   * Get words to study
   * GET /progress/topics/{topicId}/study
   */
  getStudyWords: (topicId: number, count: number) =>
    api.get<ApiResponse<StudyWordsMetaData>>(
      `/progress/topics/${topicId}/study`,
      { count }
    ),

  /**
   * Get words to review
   * GET /progress/review
   */
  getReviewWords: (params?: PaginationParams) =>
    api.get<ApiResponse<ReviewWordsMetaData>>("/progress/review", params),

  /**
   * Create word progress after learning
   * POST /progress
   */
  createWordProgress: (data: CreateWordProgressRequest) =>
    api.post<ApiResponse<CreateWordProgressMetaData>>("/progress", data),

  /**
   * Update word progress after review
   * PATCH /progress
   */
  updateWordProgress: (data: UpdateWordProgressRequest) =>
    api.patch<ApiResponse<UpdateWordProgressMetaData>>("/progress", data),

  // === Admin endpoints (Now aligned with Lingora_FE /words) ===
  admin: {
    getAll: async (page = 1, limit = 10, search?: string, sort?: string, cefrLevel?: string, type?: string, hasTopic?: boolean) => {
       return api.get<ApiResponse<WordListResponse>>("/words", {
         page, limit, search, sort, cefrLevel, type, hasTopic
       });
    },

    // Nested words in topic (Strict Alignment)
    getTopicWords: async (topicId: number, page = 1, limit = 10, search?: string, sort?: string, cefrLevel?: string, type?: string) => {
       // GET /topics/{id}/words
       return api.get<ApiResponse<WordListResponse>>(`/topics/${topicId}/words`, {
         page, limit, search, sort, cefrLevel, type
       });
    },

    create: async (data: any) => {
      return api.post<ApiResponse<any>>("/words", data);
    },

    update: (id: number, data: UpdateWordRequest) =>
      api.patch<ApiResponse<Word>>(`/words/${id}`, data),

    delete: (id: number) =>
      api.delete<ApiResponse<any>>(`/words/${id}`),
  },

  // === Dictionary endpoints ===
  
  /**
   * Get word suggestions
   * GET /words/suggest
   */
  getSuggestWords: (term: string, limit?: number) =>
    api.get<ApiResponse<unknown[]>>("/words/suggest", { term, limit }),

  /**
   * Lookup a word in dictionary
   * GET /words/dictionary
   */
  lookupWord: (term: string) =>
    api.get<ApiResponse<unknown>>("/words/dictionary", { term }),
};
