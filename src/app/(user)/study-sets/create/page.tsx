"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudySetMutation } from "@/hooks/useStudySet";
import { FlashcardForm, QuizForm } from "@/components/studysets";
import {
  StudySetVisibility,
  QuizType,
  type FlashcardFormData,
  type QuizFormData,
  joinCorrectAnswers,
} from "@/types/studySet";

type TabType = "flashcards" | "quizzes";

export default function CreateStudySetPage() {
  const router = useRouter();
  const { create, isLoading, error } = useStudySetMutation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<StudySetVisibility>(StudySetVisibility.PUBLIC);
  const [price, setPrice] = useState(0);

  const [flashcards, setFlashcards] = useState<FlashcardFormData[]>([
    { frontText: "", backText: "" },
  ]);
  const [quizzes, setQuizzes] = useState<QuizFormData[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>("flashcards");

  // Flashcard handlers
  const addFlashcard = useCallback(() => {
    setFlashcards((prev) => [...prev, { frontText: "", backText: "" }]);
  }, []);

  const updateFlashcard = useCallback((index: number, updated: FlashcardFormData) => {
    setFlashcards((prev) =>
      prev.map((fc, i) => (i === index ? updated : fc))
    );
  }, []);

  const removeFlashcard = useCallback((index: number) => {
    setFlashcards((prev) => {
      const fc = prev[index];
      if (fc?.previewUrl) URL.revokeObjectURL(fc.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Quiz handlers
  const addQuiz = useCallback(() => {
    setQuizzes((prev) => [
      ...prev,
      {
        type: QuizType.MULTIPLE_CHOICE,
        question: "",
        options: ["", "", "", ""],
        selectedCorrectOptions: [],
      },
    ]);
  }, []);

  const updateQuiz = useCallback((index: number, updated: QuizFormData) => {
    setQuizzes((prev) =>
      prev.map((q, i) => (i === index ? updated : q))
    );
  }, []);

  const removeQuiz = useCallback((index: number) => {
    setQuizzes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    const validFlashcards = flashcards.filter(
      (fc) => fc.frontText.trim() && fc.backText.trim()
    );

    // Collect pending images (index -> File)
    const pendingImages = new Map<number, File>();
    validFlashcards.forEach((fc, idx) => {
      if (fc.pendingImage) {
        pendingImages.set(idx, fc.pendingImage);
      }
    });

    // Convert quizzes: join selectedCorrectOptions to correctAnswer
    const validQuizzes = quizzes
      .filter((q) => q.question.trim() && q.selectedCorrectOptions.length > 0)
      .map((q) => ({
        type: q.type,
        question: q.question,
        options: q.options.filter((opt) => opt.trim()),
        correctAnswer: joinCorrectAnswers(q.selectedCorrectOptions),
      }));

    // Create
    const result = await create(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        price: visibility === StudySetVisibility.PRIVATE ? 0 : price,
        flashcards: validFlashcards.map(({ frontText, backText, example, imageUrl }) => ({
          frontText,
          backText,
          example: example || undefined,
          imageUrl,
        })),
        quizzes: validQuizzes,
      },
      pendingImages
    );

    if (result) {
      // Use replace so back button goes to list, not create form
      router.replace(`/study-sets/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-50)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--neutral-200)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--neutral-600)] hover:text-[var(--neutral-900)]"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo học liệu"
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-[var(--error)]/10 text-[var(--error)]">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-[var(--neutral-200)] p-5 space-y-4">
          <h2 className="text-lg font-bold text-[var(--neutral-900)]">
            Thông tin cơ bản
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
              Tiêu đề <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề học liệu..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả về học liệu..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
                Hiển thị
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as StudySetVisibility)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] bg-white"
              >
                <option value={StudySetVisibility.PUBLIC}>Công khai</option>
                <option value={StudySetVisibility.PRIVATE}>Riêng tư</option>
              </select>
            </div>

            {visibility === StudySetVisibility.PUBLIC && (
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
                  Giá (đ)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={Math.floor(price).toLocaleString("vi-VN")}
                  onChange={(e) => {
                    // Remove dots (thousands separator) before parsing
                    const rawValue = e.target.value.replace(/\./g, "");
                    const numValue = parseInt(rawValue, 10);
                    setPrice(isNaN(numValue) ? 0 : Math.max(0, numValue));
                  }}
                  placeholder="0 = Miễn phí"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "flashcards"
                ? "bg-[var(--primary-500)] text-white"
                : "bg-white text-[var(--neutral-600)] border border-[var(--neutral-200)]"
            )}
          >
            Flashcards ({flashcards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "quizzes"
                ? "bg-[var(--primary-500)] text-white"
                : "bg-white text-[var(--neutral-600)] border border-[var(--neutral-200)]"
            )}
          >
            Quizzes ({quizzes.length})
          </button>
        </div>

        {/* Flashcards Tab */}
        {activeTab === "flashcards" && (
          <div className="space-y-4">
            {flashcards.map((fc, idx) => (
              <FlashcardForm
                key={idx}
                index={idx}
                flashcard={fc}
                onUpdate={(updated) => updateFlashcard(idx, updated)}
                onRemove={() => removeFlashcard(idx)}
              />
            ))}
            <button
              type="button"
              onClick={addFlashcard}
              className="w-full py-4 rounded-xl border-2 border-dashed border-[var(--neutral-300)] text-[var(--neutral-600)] font-medium hover:border-[var(--primary-500)] hover:text-[var(--primary-500)] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm thẻ mới
            </button>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div className="space-y-4">
            {quizzes.map((q, idx) => (
              <QuizForm
                key={idx}
                index={idx}
                quiz={q}
                onUpdate={(updated) => updateQuiz(idx, updated)}
                onRemove={() => removeQuiz(idx)}
              />
            ))}
            <button
              type="button"
              onClick={addQuiz}
              className="w-full py-4 rounded-xl border-2 border-dashed border-[var(--neutral-300)] text-[var(--neutral-600)] font-medium hover:border-[var(--primary-500)] hover:text-[var(--primary-500)] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm câu hỏi mới
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
