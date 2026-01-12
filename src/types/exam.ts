/**
 * Exam Types
 * Based on Lingora_FE/user/exam/domain/model/ExamModels.kt
 */

// ==================== Enums ====================

export type ExamType = 'IELTS' | 'TOEIC' | 'TOEFL';

export type ExamSectionType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export type ExamGroupType = 'LISTENING_PART' | 'PASSAGE' | 'WRITING_TASK' | 'SPEAKING_PART';

export type ExamQuestionType = 
  | 'MULTIPLE_CHOICE' 
  | 'TRUE_FALSE' 
  | 'SHORT_ANSWER'
  | 'NOTE_COMPLETION' 
  | 'DIAGRAM_LABELING' 
  | 'ESSAY'
  | 'SPEAKING_PROMPT' 
  | 'FILL_IN_THE_BLANK' 
  | 'MATCHING' 
  | 'YES_NO_NOT_GIVEN';

export type ExamAttemptMode = 'SECTION' | 'FULL';

export type ExamAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';

// ==================== Core Models ====================

export interface Exam {
  id: number;
  examType: ExamType;
  code: string;
  title: string;
  isPublished: boolean;
  metadata?: Record<string, unknown>;
  sections: ExamSection[];
}

export interface ExamSection {
  id: number;
  sectionType: ExamSectionType;
  title?: string;
  durationSeconds?: number;
  instructions?: string;
  audioUrl?: string;
  status?: 'NOT_STARTED' | 'COMPLETED';
  groups?: ExamSectionGroup[];
}

export interface ExamSectionGroup {
  id: number;
  groupType: ExamGroupType;
  title?: string;
  description?: string;
  content?: string;
  resourceUrl?: string;
  metadata?: Record<string, unknown>;
  questionGroups: ExamQuestionGroup[];
}

export interface ExamQuestionGroup {
  id: number;
  title?: string;
  description?: string;
  content?: string;
  resourceUrl?: string;
  metadata?: Record<string, unknown>;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  questionType: ExamQuestionType;
  prompt: string;
  options?: unknown; // Can be string[] or {key: string, value: string}[]
  correctAnswer?: unknown;
  explanation?: string;
  metadata?: Record<string, unknown>;
}

// ==================== Attempt Models ====================

export interface ExamAttempt {
  id: number;
  examId: number;
  examTitle?: string;
  examCode?: string;
  mode: ExamAttemptMode;
  status: ExamAttemptStatus;
  startedAt?: string;
  submittedAt?: string;
  sectionProgress?: Record<number, SectionProgress>;
  scoreSummary?: ScoreSummary;
  user?: {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
  };
  exam?: {
    id: number;
    title: string;
    code: string;
    examType?: ExamType;
  };
}

export interface SectionProgress {
  sectionId: number;
  status: string;
  correctCount?: number;
  totalQuestions?: number;
  earnedScore?: number;
  band?: number;
}

export interface ScoreSummary {
  sections: SectionScore[];
  overallBand?: number;
  overallScore?: number;
  bands?: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    overall?: number;
  };
}

export interface SectionScore {
  sectionType: ExamSectionType;
  correctCount?: number;
  totalQuestions?: number;
  band?: number;
  status?: string;
}

export interface ExamAttemptAnswer {
  id: number;
  attemptId: number;
  sectionId: number;
  questionId: number;
  answer?: unknown;
  isCorrect?: boolean;
  score?: number;
  aiFeedback?: string;
}

// ==================== Request/Response Types ====================

export interface ExamListParams {
  page?: number;
  limit?: number;
  examType?: ExamType;
  search?: string;
  isPublished?: boolean;
}

export interface ExamListResponse {
  exams: Exam[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface AttemptListParams {
  page?: number;
  limit?: number;
}

export interface AttemptListResponse {
  attempts: ExamAttempt[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface StartAttemptRequest {
  mode: ExamAttemptMode;
  sectionId?: number;
  resumeLast?: boolean;
}

export interface SubmitSectionRequest {
  answers: AnswerPayload[];
}

export interface AnswerPayload {
  questionId: number;
  answer: unknown;
}

// ==================== Attempt Detail Types ====================

export interface AttemptDetailResponse {
  attempt: ExamAttempt;
  exam?: {
    id: number;
    title?: string;
    examType?: ExamType;
    code?: string;
  };
  user?: {
    id: number;
    username?: string;
  };
  scoreSummary?: AttemptScoreSummary;
  sections?: AttemptSection[];
}

export interface AttemptScoreSummary {
  overallScore?: number;
  sections?: Record<string, AttemptSectionScore>;
  totals?: {
    totalQuestions?: number;
    totalCorrect?: number;
    totalScore?: number;
  };
  bands?: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    overall?: number;
  };
}

export interface AttemptSectionScore {
  sectionType?: string;
  score?: number;
  correct?: number;
  total?: number;
  correctCount?: number;
  totalQuestions?: number;
  earnedScore?: number;
  band?: number;
}

export interface AttemptSection {
  id: number;
  title?: string;
  sectionType: ExamSectionType;
  groups?: AttemptSectionGroup[];
}

export interface AttemptSectionGroup {
  id: number;
  title?: string;
  groupType?: string;
  questionGroups?: AttemptQuestionGroup[];
}

export interface AttemptQuestionGroup {
  id: number;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  questions?: AttemptQuestion[];
}

export interface AttemptQuestion {
  id?: number;
  questionId?: number;
  prompt?: string;
  questionType?: ExamQuestionType;
  options?: unknown;
  correctAnswer?: unknown;
  explanation?: string;
  userAnswer?: unknown;
  isCorrect?: boolean;
  score?: number;
  aiFeedback?: unknown;
}
