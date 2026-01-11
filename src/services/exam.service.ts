/**
 * Exam Service
 * API calls for exam module
 */

import { api } from './api';
import { ApiResponse } from '@/types/api';
import {
  Exam,
  ExamSection,
  ExamListParams,
  ExamListResponse,
  ExamAttempt,
  AttemptListParams,
  AttemptListResponse,
  AttemptDetailResponse,
  StartAttemptRequest,
  SubmitSectionRequest,
} from '@/types/exam';

// ==================== List & Detail ====================

/**
 * Get list of exams with optional filters
 */
export async function listExams(params?: ExamListParams): Promise<ExamListResponse> {
  const response = await api.get<ApiResponse<ExamListResponse>>('/exams', {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    examType: params?.examType,
    search: params?.search,
    isPublished: params?.isPublished ?? true,
  });
  return response.metaData;
}

/**
 * Get exam detail with sections
 */
export async function getExamDetail(examId: number): Promise<Exam> {
  const response = await api.get<ApiResponse<Exam>>(`/exams/${examId}`);
  return response.metaData;
}

/**
 * Get section detail with questions
 */
export async function getSectionDetail(
  examId: number,
  sectionId: number
): Promise<ExamSection> {
  const response = await api.get<ApiResponse<ExamSection>>(
    `/exams/${examId}/sections/${sectionId}`
  );
  return response.metaData;
}

// ==================== Attempt Workflow ====================

/**
 * Start a new exam attempt
 * @param examId - The exam ID
 * @param request - Mode (FULL/SECTION), optional sectionId for SECTION mode
 */
export async function startExamAttempt(
  examId: number,
  request: StartAttemptRequest
): Promise<ExamAttempt> {
  const response = await api.post<ApiResponse<ExamAttempt>>(
    `/exams/${examId}/start`,
    request
  );
  return response.metaData;
}

/**
 * Submit answers for a section
 * @param attemptId - The attempt ID
 * @param sectionId - The section ID
 * @param request - Array of answers
 */
export async function submitSectionAttempt(
  attemptId: number,
  sectionId: number,
  request: SubmitSectionRequest
): Promise<ExamAttempt> {
  const response = await api.post<ApiResponse<ExamAttempt>>(
    `/exam-attempts/${attemptId}/sections/${sectionId}/submit`,
    request
  );
  return response.metaData;
}

/**
 * Finalize and submit the entire attempt
 * @param attemptId - The attempt ID
 */
export async function submitExamAttempt(attemptId: number): Promise<ExamAttempt> {
  const response = await api.post<ApiResponse<ExamAttempt>>(
    `/exam-attempts/${attemptId}/submit`
  );
  return response.metaData;
}

// ==================== Attempt History ====================

/**
 * Get user's attempt history
 */
export async function listAttempts(
  params?: AttemptListParams
): Promise<AttemptListResponse> {
  const response = await api.get<ApiResponse<AttemptListResponse>>('/exam-attempts', {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  });
  return response.metaData;
}

/**
 * Get attempt detail with scores and answers
 */
export async function getAttemptDetail(attemptId: number): Promise<AttemptDetailResponse> {
  const response = await api.get<ApiResponse<AttemptDetailResponse>>(
    `/exam-attempts/${attemptId}`
  );
  return response.metaData;
}

// ==================== Export Service Object ====================

export const examService = {
  listExams,
  getExamDetail,
  getSectionDetail,
  startExamAttempt,
  submitSectionAttempt,
  submitExamAttempt,
  listAttempts,
  getAttemptDetail,
};
