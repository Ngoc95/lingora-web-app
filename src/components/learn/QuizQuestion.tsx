"use client";

import { useState } from "react";
import { Volume2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { GameType, GAME_TYPE_LABELS } from "@/types/vocabulary";
import type { QuizQuestion } from "@/types/vocabulary";

interface QuizQuestionProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  typedAnswer: string;
  isAnswerChecked: boolean;
  onSelectAnswer: (answer: string) => void;
  onTypeAnswer: (answer: string) => void;
  onCheckAnswer: () => void;
}

export function QuizQuestionComponent({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  typedAnswer,
  isAnswerChecked,
  onSelectAnswer,
  onTypeAnswer,
  onCheckAnswer,
}: QuizQuestionProps) {
  const handlePlayAudio = () => {
    if (question.word.audioUrl) {
      const audio = new Audio(question.word.audioUrl);
      audio.play().catch(console.error);
    }
  };

  const isCorrect =
    isAnswerChecked &&
    (selectedAnswer || typedAnswer).toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

  const showTextInput =
    question.type === GameType.LISTEN_FILL;

  const canCheck = showTextInput ? typedAnswer.trim().length > 0 : !!selectedAnswer;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-[var(--neutral-200)] overflow-hidden">
        <div className="p-6">
          {/* Quiz Type Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
              {GAME_TYPE_LABELS[question.type]}
            </span>
            {(question.type === GameType.LISTEN_FILL ||
              question.type === GameType.LISTEN_CHOOSE) && (
              <button
                type="button"
                onClick={handlePlayAudio}
                className="p-2 rounded-full hover:bg-[var(--neutral-100)] transition-colors"
                disabled={!question.word.audioUrl}
              >
                <Volume2
                  className={cn(
                    "w-6 h-6",
                    question.word.audioUrl
                      ? "text-[var(--primary-500)]"
                      : "text-[var(--neutral-400)]"
                  )}
                />
              </button>
            )}
          </div>

          {/* Question Text */}
          <p className="text-lg font-medium text-[var(--neutral-900)] mb-6">
            {question.question}
          </p>

          {/* Options / Input */}
          {showTextInput ? (
            <div className="space-y-4">
              <Input
                type="text"
                value={typedAnswer}
                onChange={(e) => onTypeAnswer(e.target.value)}
                placeholder="Nhập câu trả lời..."
                disabled={isAnswerChecked}
                className={cn(
                  "text-lg py-6",
                  isAnswerChecked && isCorrect && "border-[var(--success)] bg-[var(--success)]/5",
                  isAnswerChecked && !isCorrect && "border-[var(--error)] bg-[var(--error)]/5"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canCheck && !isAnswerChecked) {
                    onCheckAnswer();
                  }
                }}
              />
              {isAnswerChecked && !isCorrect && (
                <p className="text-sm text-[var(--neutral-600)]">
                  Đáp án đúng: <strong className="text-[var(--success)]">{question.correctAnswer}</strong>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === question.correctAnswer;
                const showCorrect = isAnswerChecked && isCorrectOption;
                const showWrong = isAnswerChecked && isSelected && !isCorrectOption;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isAnswerChecked && onSelectAnswer(option)}
                    disabled={isAnswerChecked}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all duration-200 border-2",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2",
                      isSelected && !isAnswerChecked &&
                        "border-[var(--primary-500)] bg-[var(--primary-500)]/5",
                      !isSelected && !isAnswerChecked &&
                        "border-[var(--neutral-200)] hover:border-[var(--neutral-400)]",
                      showCorrect && "border-[var(--success)] bg-[var(--success)]/10",
                      showWrong && "border-[var(--error)] bg-[var(--error)]/10",
                      isAnswerChecked && !showCorrect && !showWrong && "border-[var(--neutral-200)] opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--neutral-900)]">
                        {option}
                      </span>
                      {showCorrect && (
                        <Check className="w-5 h-5 text-[var(--success)]" />
                      )}
                      {showWrong && (
                        <X className="w-5 h-5 text-[var(--error)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Check Button */}
        {!isAnswerChecked && (
          <div className="p-4 bg-[var(--neutral-50)] border-t border-[var(--neutral-200)]">
            <button
              type="button"
              onClick={onCheckAnswer}
              disabled={!canCheck}
              className={cn(
                "w-full py-3 rounded-xl font-medium transition-all duration-200",
                canCheck
                  ? "bg-[var(--primary-500)] text-white hover:bg-[var(--primary-500)]/90"
                  : "bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed"
              )}
            >
              Kiểm tra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
