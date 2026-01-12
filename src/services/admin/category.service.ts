import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";

export interface Category {
  id: number;
  name: string;
  description: string;
  image?: string;
  totalTopics: number;
}

export interface CategoryListMetaData {
  currentPage: number;
  totalPages: number;
  total: number;
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  image?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

export const categoryService = {
  getAll: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<CategoryListMetaData>>("/categories", { page, limit, search }),

  getById: (id: number) => 
    api.get<ApiResponse<Category>>(`/categories/${id}/topics`), // Fetches category details with topics usually

  getWithTopics: (id: number) =>
    api.get<ApiResponse<Category>>(`/categories/${id}/topics`),

  create: (data: CreateCategoryRequest) => 
    api.post<ApiResponse<Category>>("/categories", data),

  update: (id: number, data: UpdateCategoryRequest) =>
    api.patch<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<any>>(`/categories/${id}`),
};
