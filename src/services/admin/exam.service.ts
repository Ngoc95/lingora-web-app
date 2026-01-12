import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { Exam, ExamAttempt } from "@/types/exam";

export type { Exam, ExamAttempt };

interface ExamListResponse {
  exams: Exam[];
  totalPages: number;
  currentPage: number;
  totalExams: number;
}

interface AttemptListResponse {
  attempts: ExamAttempt[];
  totalPages: number;
  currentPage: number;
  totalAttempts: number;
}

export interface UpdateExamRequest {
  title?: string;
  code?: string;
  examType?: string;
  isPublished?: boolean;
  description?: string;
  thumbnailUrl?: string;
}

export const examAdminService = {
  getAll: async (page = 1, limit = 10, search?: string) => {
    return api.get<ApiResponse<ExamListResponse>>("/exams", { page, limit, search });
  },

  create: async (data: any) => {
    return api.post<ApiResponse<Exam>>("/admin/exams", data);
  },

  update: async (id: number, data: any) => {
    return api.patch<ApiResponse<Exam>>(`/admin/exams/${id}`, data);
  },

  delete: async (id: number) => {
    return api.delete<ApiResponse<void>>(`/admin/exams/${id}`);
  },

  adminListAttempts: async (params: { page?: number; limit?: number; search?: string; userId?: number; examId?: number; status?: string }) => {
    return api.get<ApiResponse<AttemptListResponse>>("/admin/exam-attempts", params);
  },

  adminGetAttemptDetail: async (attemptId: number) => {
    return api.get<ApiResponse<ExamAttempt>>(`/admin/exam-attempts/${attemptId}`);
  },

  importExam: async (data: any) => {
    return api.post<ApiResponse<void>>("/admin/exams/import", data);
  }
};
