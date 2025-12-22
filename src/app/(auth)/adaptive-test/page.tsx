"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question: string;
  options: string[];
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Chọn câu đúng:",
    options: [
      "I am going to the store.",
      "I going to the store.",
      "I goes to the store.",
      "I go to store.",
    ],
  },
  {
    id: 2,
    question: "Thì quá khứ của 'run' là gì?",
    options: ["runned", "ran", "running", "runs"],
  },
  {
    id: 3,
    question: "Từ nào là danh từ?",
    options: ["quickly", "happiness", "beautiful", "run"],
  },
  {
    id: 4,
    question: "Hoàn thành: She ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
  },
  {
    id: 5,
    question: "Chọn giới từ đúng: I live ___ New York.",
    options: ["at", "on", "in", "to"],
  },
];

export default function AdaptiveTestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to submit adaptive test results
      // const result = await adaptiveTestApi.submit(answers);
      // Determine proficiency level based on results
      
      // Redirect to vocabulary page (user home)
      router.push("/vocabulary");
    } catch (err) {
      console.error("Failed to submit test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / SAMPLE_QUESTIONS.length) * 100;
  const question = SAMPLE_QUESTIONS[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
          Kiểm tra trình độ
        </h1>
        <p className="text-sm text-[var(--neutral-600)]">
          Trả lời các câu hỏi để xác định trình độ tiếng Anh của bạn
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-[var(--neutral-100)] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-[var(--neutral-600)] text-center">
          Câu hỏi {currentQuestion + 1} / {SAMPLE_QUESTIONS.length}
        </p>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--neutral-900)]">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? "border-[var(--primary-500)] bg-[var(--primary-500)]/5"
                  : "border-[var(--neutral-200)] hover:border-[var(--primary-500)]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedAnswer === index
                      ? "border-[var(--primary-500)] bg-[var(--primary-500)]"
                      : "border-[var(--neutral-300)]"
                  }`}
                >
                  {selectedAnswer === index && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-[var(--neutral-900)]">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 border border-[var(--neutral-200)] rounded-lg font-medium text-[var(--neutral-900)] hover:bg-[var(--neutral-50)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>

        <div className="flex-1" />

        {currentQuestion < SAMPLE_QUESTIONS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={selectedAnswer === undefined}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white font-semibold hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === undefined || isLoading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white font-semibold hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang gửi..." : "Hoàn thành"}
          </button>
        )}
      </div>
    </div>
  );
}

