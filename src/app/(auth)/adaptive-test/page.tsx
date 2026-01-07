"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  adaptiveTestService,
  type AdaptiveQuestion,
  type AnsweredQuestion,
  type AnswerEvaluation,
} from "@/services/adaptiveTest.service";

type TestPhase = "loading" | "question" | "result";

export default function AdaptiveTestPage() {
  const router = useRouter();

  // State
  const [phase, setPhase] = useState<TestPhase>("loading");
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Feedback & Progression State
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [pendingNextStep, setPendingNextStep] = useState<{
    isCompleted: boolean;
    proficiency: string | null;
    nextQuestion: AdaptiveQuestion | null;
  } | null>(null);

  const [finalProficiency, setFinalProficiency] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start test on mount
  useEffect(() => {
    startTest();
  }, []);

  const startTest = async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await adaptiveTestService.getNextQuestion([]);
      const data = res.metaData;
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setAnsweredCount(data.answeredCount);
        setPhase("question");
      }
    } catch (err: any) {
      setError(err?.message || "Không thể bắt đầu bài kiểm tra");
      setPhase("question"); // Show error in question phase
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (phase !== "question" || lastEvaluation) return; // Disable selection if reviewing
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer) return;

    setIsSubmitting(true);
    setError(null);

    const newAnsweredQuestions: AnsweredQuestion[] = [
      ...answeredQuestions,
      { questionId: currentQuestion.id, answer: selectedAnswer },
    ];

    try {
      const res = await adaptiveTestService.getNextQuestion(newAnsweredQuestions);
      const data = res.metaData;

      // Update state
      setAnsweredQuestions(newAnsweredQuestions);
      setAnsweredCount(data.answeredCount);

      // Get evaluation for the question we just answered
      const evaluation = data.answerEvaluations.find(
        (e) => e.questionId === currentQuestion.id
      );
      setLastEvaluation(evaluation || null);

      // Store next step but wait for user to click Continue
      setPendingNextStep({
        isCompleted: data.isCompleted,
        proficiency: data.proficiency,
        nextQuestion: data.nextQuestion
      });

    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!pendingNextStep) return;

    if (pendingNextStep.isCompleted) {
      setFinalProficiency(pendingNextStep.proficiency);
      setPhase("result");
    } else if (pendingNextStep.nextQuestion) {
      setCurrentQuestion(pendingNextStep.nextQuestion);
      setPhase("question");
    }

    // Reset per-question state
    setSelectedAnswer(null);
    setLastEvaluation(null);
    setPendingNextStep(null);
  };

  const { refreshProfile } = useAuth();

  const handleFinish = async () => {
    await refreshProfile();
    router.push("/vocabulary");
  };

  // Helper to determine option style
  const getOptionStyle = (option: string) => {
    // Review Mode
    if (lastEvaluation) {
      // If user selected this and it's correct -> Green
      if (option === selectedAnswer && lastEvaluation.isCorrect) {
        return "border-green-500 bg-green-50 text-green-700 font-medium";
      }
      // If this is the explicit correct answer (for when user was wrong) -> Green
      if (option === lastEvaluation.correctAnswer) {
         return "border-green-500 bg-green-50 text-green-700 font-medium";
      }
      // If user selected this and it was WRONG -> Red
      if (option === selectedAnswer && !lastEvaluation.isCorrect) {
        return "border-red-500 bg-red-50 text-red-700 font-medium";
      }
      // Other options faded
      return "border-[var(--neutral-200)] opacity-50";
    }

    // Normal Mode
    if (selectedAnswer === option) {
      return "border-[var(--primary-500)] bg-[var(--primary-500)]/5 shadow-sm";
    }
    return "border-[var(--neutral-200)] hover:border-[var(--primary-500)]/50 hover:bg-[var(--neutral-50)]";
  };

  const getOptionIcon = (option: string) => {
    if (lastEvaluation) {
       // Reliable check: If selected and Correct -> Show Tick
       if (option === selectedAnswer && lastEvaluation.isCorrect) {
         return <CheckCircle className="w-6 h-6 text-green-600 fill-green-100" />;
       }
       // If this matches correct answer string -> Show Tick
       if (option === lastEvaluation.correctAnswer) {
         return <CheckCircle className="w-6 h-6 text-green-600 fill-green-100" />;
       }
       // If selected and Wrong -> Show X
       if (option === selectedAnswer && !lastEvaluation.isCorrect) {
         return <XCircle className="w-6 h-6 text-red-600 fill-red-100" />;
       }
    }
    
    // Default radio circle
    return (
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selectedAnswer === option
            ? "border-[var(--primary-500)] bg-[var(--primary-500)]"
            : "border-[var(--neutral-300)]"
        }`}
      >
        {selectedAnswer === option && (
          <div className="w-2 h-2 bg-white rounded-full" />
        )}
      </div>
    );
  };

  // Render loading
  if (phase === "loading") {
    return (
      <CenteredCardLayout title="Kiểm tra trình độ" showBackLink={false}>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-500)]" />
          <p className="text-[var(--neutral-600)]">Đang tải câu hỏi...</p>
        </div>
      </CenteredCardLayout>
    );
  }

  // Render result
  if (phase === "result") {
    const proficiencyLabels: Record<string, string> = {
      BEGINNER: "Sơ cấp",
      INTERMEDIATE: "Trung cấp",
      ADVANCED: "Nâng cao",
    };

    const proficiencyColors: Record<string, string> = {
      BEGINNER: "text-blue-500",
      INTERMEDIATE: "text-yellow-500",
      ADVANCED: "text-green-500",
    };

    return (
      <CenteredCardLayout title="Kết quả" showBackLink={false}>
        <div className="flex flex-col items-center text-center py-8 gap-6">
          <div className="w-20 h-20 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[var(--primary-500)]" />
          </div>

          <div className="space-y-2">
            <p className="text-[var(--neutral-600)]">Trình độ của bạn là</p>
            <h2
              className={`text-3xl font-bold ${
                proficiencyColors[finalProficiency || "BEGINNER"] ||
                "text-[var(--primary-500)]"
              }`}
            >
              {proficiencyLabels[finalProficiency || "BEGINNER"] || finalProficiency}
            </h2>
          </div>

          <p className="text-sm text-[var(--neutral-600)]">
            Bạn đã hoàn thành {answeredCount} câu hỏi
          </p>

          <button
            onClick={handleFinish}
            className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm hover:bg-[var(--primary-500)]/90 transition-all cursor-pointer"
          >
            Bắt đầu học
          </button>
        </div>
      </CenteredCardLayout>
    );
  }

  // Render question (and inline feedback)
  return (
    <CenteredCardLayout
      title="Kiểm tra trình độ"
      subtitle={`Câu ${answeredCount + 1}`}
      showBackLink={false}
      className="max-w-lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      {currentQuestion ? (
        <div className="space-y-6">
          {/* Passage */}
          {currentQuestion.passage && (
            <div className="p-4 rounded-xl bg-[var(--neutral-50)] border border-[var(--neutral-200)] text-sm text-[var(--neutral-700)]">
              {currentQuestion.passage}
            </div>
          )}

          {/* Question text */}
          <h3 className="text-lg font-medium text-[var(--neutral-900)]">
            {currentQuestion.text}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={isSubmitting || !!lastEvaluation}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${getOptionStyle(option)}`}
              >
                <div className="flex items-center gap-3">
                  {getOptionIcon(option)}
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit / Continue button */}
          {!lastEvaluation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm hover:bg-[var(--primary-500)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSubmitting ? "Đang gửi..." : "Gửi câu trả lời"}
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm hover:bg-[var(--primary-500)]/90 transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>
      ) : (
        <div className="text-center py-8 text-[var(--neutral-600)]">
          Không có câu hỏi nào
        </div>
      )}
    </CenteredCardLayout>
  );
}
