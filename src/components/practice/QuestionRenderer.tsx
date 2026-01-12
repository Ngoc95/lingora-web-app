"use client";

/**
 * Question Renderer Component
 * Renders different question types for exam sections
 */

import { ExamQuestion, ExamQuestionType } from "@/types/exam";

interface QuestionRendererProps {
  question: ExamQuestion;
  index: number;
  answer: unknown;
  onAnswer: (value: unknown) => void;
  showResult?: boolean;
}

export function QuestionRenderer({
  question,
  index,
  answer,
  onAnswer,
  showResult = false,
}: QuestionRendererProps) {
  const renderContent = () => {
    switch (question.questionType) {
      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoiceQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );
      case "TRUE_FALSE":
      case "YES_NO_NOT_GIVEN":
        return (
          <TrueFalseQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );
      case "SHORT_ANSWER":
      case "FILL_IN_THE_BLANK":
      case "NOTE_COMPLETION":
        return (
          <ShortAnswerQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );
      case "MATCHING":
        return (
          <MatchingQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );
      case "ESSAY":
        return (
          <EssayQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
          />
        );
      case "SPEAKING_PROMPT":
        return (
          <SpeakingQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
          />
        );
      default:
        return (
          <ShortAnswerQuestion
            question={question}
            answer={answer as string}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );
    }
  };

  // Extract imageUrl from metadata if available
  const imageUrl = 
    question.metadata && 
    typeof question.metadata === "object" && 
    "imageUrl" in question.metadata 
      ? String(question.metadata.imageUrl) 
      : null;

  return (
    <div className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
      <p className="font-medium text-neutral-800 mb-3">
        <span className="text-primary mr-2">{index}.</span>
        {question.prompt}
      </p>
      
      {/* Display image from metadata if available */}
      {imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-neutral-200">
          <img 
            src={imageUrl} 
            alt={`Question ${index} image`}
            className="w-full max-h-80 object-contain bg-neutral-50"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}

// ============================================================
// Multiple Choice Question
// ============================================================

interface MCQuestionProps {
  question: ExamQuestion;
  answer: string | null;
  onAnswer: (value: string) => void;
  showResult?: boolean;
}

function MultipleChoiceQuestion({
  question,
  answer,
  onAnswer,
  showResult,
}: MCQuestionProps) {
  const options = parseOptions(question.options);

  return (
    <div className="space-y-2">
      {options.map((opt, idx) => {
        const optValue = typeof opt === "string" ? opt : opt.key || opt.value;
        const optLabel = typeof opt === "string" ? opt : opt.value || opt.key;
        const isSelected = answer === optValue;
        const isCorrect =
          showResult && String(question.correctAnswer) === optValue;
        const isWrong = showResult && isSelected && !isCorrect;

        let className =
          "w-full p-3 text-left rounded-lg border transition-all ";
        if (showResult) {
          if (isCorrect) {
            className += "border-green-500 bg-green-50";
          } else if (isWrong) {
            className += "border-red-500 bg-red-50";
          } else {
            className += "border-neutral-200";
          }
        } else if (isSelected) {
          className += "border-primary bg-primary/10";
        } else {
          className += "border-neutral-200 hover:border-primary/50";
        }

        return (
          <button
            key={idx}
            onClick={() => !showResult && onAnswer(optValue)}
            disabled={showResult}
            className={className}
          >
            <span className="font-medium mr-2">
              {String.fromCharCode(65 + idx)}.
            </span>
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// True/False Question
// ============================================================

function TrueFalseQuestion({
  question,
  answer,
  onAnswer,
  showResult,
}: MCQuestionProps) {
  const options =
    question.questionType === "YES_NO_NOT_GIVEN"
      ? ["Yes", "No", "Not Given"]
      : ["True", "False", "Not Given"];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = answer === opt;
        const isCorrect = showResult && String(question.correctAnswer) === opt;
        const isWrong = showResult && isSelected && !isCorrect;

        let className = "px-4 py-2 rounded-lg border transition-all ";
        if (showResult) {
          if (isCorrect) {
            className += "border-green-500 bg-green-50";
          } else if (isWrong) {
            className += "border-red-500 bg-red-50";
          } else {
            className += "border-neutral-200";
          }
        } else if (isSelected) {
          className += "border-primary bg-primary/10";
        } else {
          className += "border-neutral-200 hover:border-primary/50";
        }

        return (
          <button
            key={opt}
            onClick={() => !showResult && onAnswer(opt)}
            disabled={showResult}
            className={className}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Short Answer Question
// ============================================================

interface ShortAnswerProps {
  question: ExamQuestion;
  answer: string;
  onAnswer: (value: string) => void;
  showResult?: boolean;
}

function ShortAnswerQuestion({
  question,
  answer,
  onAnswer,
  showResult,
}: ShortAnswerProps) {
  const isCorrect =
    showResult &&
    answer?.toLowerCase().trim() ===
      String(question.correctAnswer).toLowerCase().trim();

  let className =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ";
  if (showResult) {
    className += isCorrect
      ? "border-green-500 bg-green-50"
      : "border-red-500 bg-red-50";
  } else {
    className += "border-neutral-200";
  }

  return (
    <div>
      <input
        type="text"
        value={answer || ""}
        onChange={(e) => onAnswer(e.target.value)}
        disabled={showResult}
        placeholder="Nhập câu trả lời..."
        className={className}
      />
      {showResult && !isCorrect && question.correctAnswer !== undefined && question.correctAnswer !== null && (
        <p className="text-sm text-green-600 mt-2">
          Đáp án: {String(question.correctAnswer)}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Matching Question
// ============================================================

function MatchingQuestion({
  question,
  answer,
  onAnswer,
  showResult,
}: ShortAnswerProps) {
  return (
    <input
      type="text"
      value={answer || ""}
      onChange={(e) => onAnswer(e.target.value.toUpperCase())}
      disabled={showResult}
      placeholder="VD: A, B, C..."
      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        showResult ? "border-neutral-300 bg-neutral-50" : "border-neutral-200"
      }`}
    />
  );
}

// ============================================================
// Essay Question (Writing)
// ============================================================

interface EssayProps {
  question: ExamQuestion;
  answer: string;
  onAnswer: (value: string) => void;
}

function EssayQuestion({ question, answer, onAnswer }: EssayProps) {
  const wordCount = (answer || "").split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <textarea
        value={answer || ""}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Viết câu trả lời của bạn..."
        className="w-full h-48 p-4 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />
      <div className="flex justify-between text-sm text-neutral-500 mt-2">
        <span>{wordCount} từ</span>
        {question.metadata &&
          typeof question.metadata === "object" &&
          "minWords" in question.metadata && (
            <span>Tối thiểu: {String(question.metadata.minWords)} từ</span>
          )}
      </div>
    </div>
  );
}

// ============================================================
// Speaking Question
// ============================================================

function SpeakingQuestion({ question, answer, onAnswer }: EssayProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <p className="text-orange-700 text-sm mb-3">
        🎤 Phần Speaking cần ghi âm. Hiện tại chỉ hỗ trợ nhập văn bản.
      </p>
      <textarea
        value={answer || ""}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Nhập nội dung bạn muốn nói..."
        className="w-full h-32 p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-white"
      />
    </div>
  );
}

// ============================================================
// Helper Functions
// ============================================================

function parseOptions(
  options: unknown
): Array<string | { key: string; value: string }> {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === "object") {
    return Object.entries(options).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }
  return [];
}
