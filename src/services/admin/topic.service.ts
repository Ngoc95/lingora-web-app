import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";

export interface TopicCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string | null;
}
export interface Topic {
  id: number;
  name: string;
  description: string;
  image?: string;
  category?: { id: number; name: string };
  totalWords: number;
  createdAt: string | null;
}

export interface TopicListResponse {
  topics: Topic[];
  totalPages: number;
  currentPage: number;
  totalTopics: number;
}

export interface TopicListMetaData {
  currentPage: number;
  totalPages: number;
  totalTopics: number;
}

export interface CategoryWithTopicsResponse {
    // Structure based on likely DTO. Often wraps the list.
    // Or it returns the Category + topics list.
    // Lingora_FE calls it CategoryWithTopicsDto.
    // Let's assume it returns metaData that contains the category info AND the topics list?
    // Reviewing Kotlin: ApiResponse<CategoryWithTopicsDto>.
    // If it's a list with metadata, it might be:
    category: { id: number; name: string; description: string; image?: string };
    topics: Topic[];
    totalPages: number;
    currentPage: number;
    totalTopics: number;
}

export interface CreateTopicRequest {
  name: string;
  description: string;
  image?: string;
  categoryId?: number;
}

export interface UpdateTopicRequest {
  name: string;
  description: string;
  image?: string;
  categoryId?: number;
}

export const topicService = {
  // Standalone topics (can filter by hasCategory if needed, but primary use is list)
  getAll: async (page = 1, limit = 10, search?: string, sort?: string, hasCategory?: boolean) => {
    return api.get<ApiResponse<TopicListResponse>>("/topics", {
      page, limit, search, sort, hasCategory
    });
  },

  // Nested topics in category (Strict Alignment)
  getCategoryTopics: async (categoryId: number, page = 1, limit = 10, search?: string, sort?: string) => {
    return api.get<ApiResponse<CategoryWithTopicsResponse>>(`/categories/${categoryId}/topics`, {
      page, limit, search, sort
    });
  },

  getById: async (id: number) => {
    // This might be /topics/{id} or /topics/{id}/words based on usage
    // Admin Detail page uses this to get Topic Metadata. 
    // Lingora_FE uses GET "topics/{id}/words" to get topic with words.
    // But for just editing topic info, we might need GET "topics/{id}" if it exists, or extract from above.
    // Let's assume GET /topics/{id} exists for basic info, or we use the one with words.
    return api.get<ApiResponse<Topic>>(`/topics/${id}`);
  },

  create: (data: CreateTopicRequest) =>
    api.post<ApiResponse<Topic>>("/topics", data),

  update: (id: number, data: UpdateTopicRequest) =>
    api.patch<ApiResponse<Topic>>(`/topics/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<any>>(`/topics/${id}`),
};
