// ============================================================
// StudySet Types & Interfaces
// ============================================================

// Enums matching backend
export enum QuizType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export enum StudySetVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum StudySetStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

// ============================================================
// Core Interfaces
// ============================================================

export interface Flashcard {
  id?: number;
  frontText: string;
  backText: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id?: number;
  type: QuizType;
  question: string;
  options: string[];
  correctAnswer: string; // comma-separated for multiple correct answers
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySetOwner {
  id: number;
  username: string;
}

export interface StudySet {
  id: number;
  title: string;
  description?: string;
  visibility: StudySetVisibility;
  price: number;
  status: StudySetStatus;
  likeCount: number;
  commentCount: number;
  isAlreadyLike: boolean;
  isPurchased: boolean;
  owner: StudySetOwner;
  flashcards: Flashcard[];
  quizzes: Quiz[];
  totalFlashcards: number;
  totalQuizzes: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// List Response
// ============================================================

export interface StudySetListResponse {
  currentPage: number;
  totalPages: number;
  total: number;
  studySets: StudySet[];
}

// ============================================================
// Form Types (for Create/Edit)
// ============================================================

export interface FlashcardFormData {
  frontText: string;
  backText: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
  // Local state for pending upload
  pendingImage?: File;
  previewUrl?: string;
}

export interface QuizFormData {
  type: QuizType;
  question: string;
  options: string[];
  // Array for UI multi-select, will be joined to comma-separated on submit
  selectedCorrectOptions: string[];
}

export interface CreateStudySetData {
  title: string;
  description?: string;
  visibility?: StudySetVisibility;
  price?: number;
  flashcards?: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[];
  quizzes?: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateStudySetData {
  title?: string;
  description?: string;
  visibility?: StudySetVisibility;
  price?: number;
  flashcards?: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[];
  quizzes?: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>[];
}

// ============================================================
// Query Params
// ============================================================

export interface StudySetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: StudySetVisibility;
  status?: StudySetStatus;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

// ============================================================
// Buy Response
// ============================================================

export interface BuyStudySetResponse {
  paymentUrl?: string | null;
  isFree: boolean;
  message?: string;
  orderId?: string;
  amount?: number;
  transactionId?: number;
}

// ============================================================
// Cloudinary Signed URL
// ============================================================

export interface CloudinarySignedMeta {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

// ============================================================
// Quiz Session State (for learning mode)
// ============================================================

export interface QuizSessionState {
  currentIndex: number;
  selectedAnswers: Record<number, string[]>; // index -> selected options
  checkedAnswers: Set<number>;
  correctCount: number;
  showFeedback: boolean;
  showResults: boolean;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Parse comma-separated correct answers into array
 */
export function parseCorrectAnswers(correctAnswer: string): string[] {
  return correctAnswer.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Join array of correct answers into comma-separated string
 */
export function joinCorrectAnswers(answers: string[]): string {
  return answers.join(',');
}

/**
 * Check if selected answers match correct answers (order-independent)
 */
export function checkQuizAnswer(selected: string[], correctAnswer: string): boolean {
  const correct = parseCorrectAnswers(correctAnswer);
  if (selected.length !== correct.length) return false;
  const sortedSelected = [...selected].sort();
  const sortedCorrect = [...correct].sort();
  return sortedSelected.every((val, idx) => val === sortedCorrect[idx]);
}
