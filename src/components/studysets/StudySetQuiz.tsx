"use client";

import { Check, X, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizSession } from "@/hooks/useStudySet";
import { QuizType, type Quiz, parseCorrectAnswers } from "@/types/studySet";

interface StudySetQuizProps {
  quizzes: Quiz[];
  onExit: () => void;
  onComplete?: () => void;
}

export function StudySetQuiz({ quizzes, onExit, onComplete }: StudySetQuizProps) {
  const {
    currentIndex,
    currentQuiz,
    selectedAnswers,
    isChecked,
    isCorrect,
    correctCount,
    totalAnswered,
    showFeedback,
    showResults,
    isLastQuestion,
    progress,
    selectAnswer,
    setTypedAnswer,
    checkAnswer,
    nextQuestion,
    reset,
  } = useQuizSession(quizzes);

  if (quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--neutral-600)]">Không có câu hỏi quiz nào</p>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const percentage = Math.round((correctCount / quizzes.length) * 100);
    const feedback =
      percentage >= 80
        ? "Xuất sắc! 🎉"
        : percentage >= 60
        ? "Tốt lắm! 👍"
        : percentage >= 40
        ? "Cần cố gắng thêm 💪"
        : "Hãy ôn lại nhé 📚";

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-[var(--neutral-200)] p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[var(--neutral-900)] mb-6">
            Kết quả Quiz
          </h2>

          {/* Score Circle */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center">
            <span className="text-4xl font-bold text-white">{percentage}%</span>
          </div>

          <p className="text-xl font-semibold text-[var(--neutral-900)] mb-2">
            {feedback}
          </p>
          <p className="text-[var(--neutral-600)] mb-8">
            Bạn đã trả lời đúng {correctCount}/{quizzes.length} câu hỏi
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl font-semibold bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-colors"
            >
              Làm lại Quiz
            </button>
            <button
              onClick={onExit}
              className="w-full py-3 rounded-xl font-semibold border border-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors"
            >
              Quay về học liệu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuiz) return null;

  const correctAnswerList = parseCorrectAnswers(currentQuiz.correctAnswer);
  const isMultipleCorrect = correctAnswerList.length > 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neutral-200)]">
        <button
          onClick={onExit}
          className="p-2 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-600)]"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="font-medium text-[var(--neutral-900)]">
            Câu {progress.current}/{progress.total}
          </span>
          <span className="text-sm text-[var(--neutral-500)] ml-2">
            ({totalAnswered} đã làm)
          </span>
        </div>
        <button
          onClick={reset}
          className="p-2 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-600)]"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--neutral-100)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Question */}
          <div className="bg-[var(--neutral-50)] rounded-xl p-5 mb-6">
            {isMultipleCorrect && !isChecked && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--info)]/10 text-[var(--info)] mb-3">
                Chọn nhiều đáp án
              </span>
            )}
            <h3 className="text-lg md:text-xl font-bold text-[var(--neutral-900)]">
              {currentQuiz.question}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          {currentQuiz.type === QuizType.MULTIPLE_CHOICE && (
            <div className="space-y-3">
              {currentQuiz.options.map((option, idx) => {
                const isSelected = selectedAnswers.includes(option);
                const isCorrectOption = correctAnswerList.includes(option);
                const showCorrect = isChecked && isCorrectOption;
                const showWrong = isChecked && isSelected && !isCorrectOption;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => !isChecked && selectAnswer(option)}
                    disabled={isChecked}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all duration-200 border-2",
                      "focus:outline-none",
                      isSelected && !isChecked &&
                        "border-[var(--primary-500)] bg-[var(--primary-500)]/5",
                      !isSelected && !isChecked &&
                        "border-[var(--neutral-200)] hover:border-[var(--neutral-400)] bg-white",
                      showCorrect && "border-[var(--success)] bg-[var(--success)]/10",
                      showWrong && "border-[var(--error)] bg-[var(--error)]/10",
                      isChecked && !showCorrect && !showWrong && "border-[var(--neutral-200)] opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--neutral-900)]">
                        {option}
                      </span>
                      {showCorrect && <Check className="w-5 h-5 text-[var(--success)]" />}
                      {showWrong && <X className="w-5 h-5 text-[var(--error)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False Options */}
          {currentQuiz.type === QuizType.TRUE_FALSE && (
            <div className="grid grid-cols-2 gap-3">
              {["Đúng", "Sai"].map((option) => {
                const isSelected = selectedAnswers.includes(option);
                const isCorrectOption = currentQuiz.correctAnswer === option;
                const showCorrect = isChecked && isCorrectOption;
                const showWrong = isChecked && isSelected && !isCorrectOption;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => !isChecked && selectAnswer(option)}
                    disabled={isChecked}
                    className={cn(
                      "py-4 rounded-xl font-semibold transition-all duration-200 border-2",
                      isSelected && !isChecked &&
                        "border-[var(--primary-500)] bg-[var(--primary-500)] text-white",
                      !isSelected && !isChecked &&
                        "border-[var(--neutral-200)] bg-white text-[var(--neutral-700)] hover:border-[var(--neutral-400)]",
                      showCorrect && "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]",
                      showWrong && "border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short Answer */}
          {currentQuiz.type === QuizType.SHORT_ANSWER && (
            <div>
              <input
                type="text"
                value={selectedAnswers[0] || ""}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={isChecked}
                placeholder="Nhập đáp án của bạn..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl border-2 text-lg focus:outline-none transition-colors",
                  isChecked && isCorrect && "border-[var(--success)] bg-[var(--success)]/5",
                  isChecked && !isCorrect && "border-[var(--error)] bg-[var(--error)]/5",
                  !isChecked && "border-[var(--neutral-200)] focus:border-[var(--primary-500)]"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedAnswers.length > 0 && !isChecked) {
                    checkAnswer();
                  }
                }}
              />
              {isChecked && !isCorrect && (
                <p className="mt-2 text-sm text-[var(--neutral-600)]">
                  Đáp án đúng: <strong className="text-[var(--success)]">{currentQuiz.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[var(--neutral-200)] bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Feedback Card */}
          {showFeedback && (
            <div
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl mb-4",
                isCorrect ? "bg-[var(--success)]/10" : "bg-[var(--error)]/10"
              )}
            >
              {isCorrect ? (
                <Check className="w-6 h-6 text-[var(--success)]" />
              ) : (
                <X className="w-6 h-6 text-[var(--error)]" />
              )}
              <div>
                <p
                  className={cn(
                    "font-semibold",
                    isCorrect ? "text-[var(--success)]" : "text-[var(--error)]"
                  )}
                >
                  {isCorrect ? "Chính xác!" : "Sai rồi"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-[var(--neutral-600)]">
                    Đáp án đúng: {currentQuiz.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Check/Next Button */}
          {!isChecked && selectedAnswers.length > 0 ? (
            <button
              onClick={checkAnswer}
              className="w-full py-3 rounded-xl font-semibold bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-colors"
            >
              Kiểm tra
            </button>
          ) : isChecked ? (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl font-semibold bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-colors flex items-center justify-center gap-2"
            >
              {isLastQuestion ? "Xem kết quả" : "Câu tiếp theo"}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-xl font-semibold bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed"
            >
              Chọn đáp án để tiếp tục
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
