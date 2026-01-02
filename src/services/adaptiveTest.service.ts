import { apiClient } from "./api";

// Types
export interface AnsweredQuestion {
  questionId: number;
  answer: string;
}

export interface AdaptiveQuestion {
  id: number;
  skill: string;
  text: string;
  passage: string | null;
  options: string[];
  proficiency: string;
}

export interface AnswerEvaluation {
  questionId: number;
  isCorrect: boolean;
  correctAnswer: string;
  proficiency: string;
}

export interface NextQuestionResponse {
  currentProficiency: string;
  answeredCount: number;
  isCompleted: boolean;
  proficiency: string | null;
  nextQuestion: AdaptiveQuestion | null;
  answerEvaluations: AnswerEvaluation[];
}

export interface GetNextQuestionRequest {
  answeredQuestions: AnsweredQuestion[];
}

// API functions
export const adaptiveTestService = {
  /**
   * Get next question or start test
   * POST /adaptive-test/next
   */
  getNextQuestion: (answeredQuestions: AnsweredQuestion[] = []) =>
    apiClient<{ metaData: NextQuestionResponse }>("/adaptive-test/next", {
      method: "POST",
      body: JSON.stringify({ answeredQuestions }),
    }),
};
