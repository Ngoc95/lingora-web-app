"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizType, type QuizFormData } from "@/types/studySet";

interface QuizFormProps {
  index: number;
  quiz: QuizFormData;
  onUpdate: (updated: QuizFormData) => void;
  onRemove: () => void;
}

const QUIZ_TYPE_OPTIONS = [
  { value: QuizType.MULTIPLE_CHOICE, label: "Trắc nghiệm nhiều lựa chọn" },
  { value: QuizType.TRUE_FALSE, label: "Đúng/Sai" },
  { value: QuizType.SHORT_ANSWER, label: "Điền vào chỗ trống" },
];

export function QuizForm({ index, quiz, onUpdate, onRemove }: QuizFormProps) {
  const handleTypeChange = (type: QuizType) => {
    let options = quiz.options;
    let selectedCorrectOptions = quiz.selectedCorrectOptions;

    // Reset options based on type
    if (type === QuizType.TRUE_FALSE) {
      options = ["Đúng", "Sai"];
      selectedCorrectOptions = [];
    } else if (type === QuizType.MULTIPLE_CHOICE && quiz.type !== QuizType.MULTIPLE_CHOICE) {
      options = ["", "", "", ""];
      selectedCorrectOptions = [];
    } else if (type === QuizType.SHORT_ANSWER) {
      options = [];
      selectedCorrectOptions = [];
    }

    onUpdate({ ...quiz, type, options, selectedCorrectOptions });
  };

  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...quiz.options];
    const oldValue = newOptions[optIndex];
    newOptions[optIndex] = value;

    // Update selectedCorrectOptions if option value changed
    const newSelected = quiz.selectedCorrectOptions.map((opt) =>
      opt === oldValue ? value : opt
    );

    onUpdate({ ...quiz, options: newOptions, selectedCorrectOptions: newSelected });
  };

  const handleToggleCorrect = (option: string) => {
    const isSelected = quiz.selectedCorrectOptions.includes(option);
    let newSelected: string[];

    if (isSelected) {
      newSelected = quiz.selectedCorrectOptions.filter((o) => o !== option);
    } else {
      newSelected = [...quiz.selectedCorrectOptions, option];
    }

    onUpdate({ ...quiz, selectedCorrectOptions: newSelected });
  };

  const handleAddOption = () => {
    onUpdate({ ...quiz, options: [...quiz.options, ""] });
  };

  const handleRemoveOption = (optIndex: number) => {
    const removedValue = quiz.options[optIndex];
    const newOptions = quiz.options.filter((_, i) => i !== optIndex);
    const newSelected = quiz.selectedCorrectOptions.filter((o) => o !== removedValue);
    onUpdate({ ...quiz, options: newOptions, selectedCorrectOptions: newSelected });
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--neutral-200)] p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[var(--neutral-900)]">
          Câu hỏi #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-400)] hover:text-[var(--error)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Quiz Type */}
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
            Loại câu hỏi
          </label>
          <select
            value={quiz.type}
            onChange={(e) => handleTypeChange(e.target.value as QuizType)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] bg-white"
          >
            {QUIZ_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
            Câu hỏi <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="text"
            value={quiz.question}
            onChange={(e) => onUpdate({ ...quiz, question: e.target.value })}
            placeholder="Nhập câu hỏi..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
          />
        </div>

        {/* Options for Multiple Choice */}
        {quiz.type === QuizType.MULTIPLE_CHOICE && (
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
              Các đáp án <span className="text-[var(--neutral-400)]">(tick = đúng)</span>
            </label>
            <div className="space-y-2">
              {quiz.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={option !== "" && quiz.selectedCorrectOptions.includes(option)}
                    onChange={() => option && handleToggleCorrect(option)}
                    disabled={!option}
                    className="w-5 h-5 rounded border-[var(--neutral-300)] text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                  />
                  <span className="text-sm font-medium text-[var(--neutral-600)] w-6">
                    {String.fromCharCode(65 + optIndex)}:
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                    placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
                  />
                  {quiz.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIndex)}
                      className="p-1.5 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-400)] hover:text-[var(--error)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {quiz.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-1 text-sm text-[var(--primary-500)] hover:text-[var(--primary-600)] font-medium"
              >
                <Plus className="w-4 h-4" />
                Thêm đáp án
              </button>
            )}
            <p className="mt-2 text-xs text-[var(--neutral-500)]">
              ✓ Có thể chọn nhiều đáp án đúng
            </p>
          </div>
        )}

        {/* True/False options */}
        {quiz.type === QuizType.TRUE_FALSE && (
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
              Đáp án đúng
            </label>
            <div className="flex gap-3">
              {["Đúng", "Sai"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate({ ...quiz, selectedCorrectOptions: [opt] })}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg font-medium transition-all",
                    quiz.selectedCorrectOptions.includes(opt)
                      ? "bg-[var(--primary-500)] text-white"
                      : "bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Short Answer */}
        {quiz.type === QuizType.SHORT_ANSWER && (
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
              Đáp án đúng <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={quiz.selectedCorrectOptions[0] || ""}
              onChange={(e) =>
                onUpdate({ ...quiz, selectedCorrectOptions: [e.target.value] })
              }
              placeholder="Nhập đáp án..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
