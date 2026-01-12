"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useStudySetDetail } from "@/hooks/useStudySet";
import { StudySetFlashcard } from "@/components/studysets";

export default function FlashcardModePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { studySet, isLoading, error } = useStudySetDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100/50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !studySet || studySet.flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Không có flashcard nào</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <h1 className="text-2xl font-bold text-neutral-900">
            {studySet.title}
          </h1>
          <p className="text-neutral-600 mt-1">
            Luyện tập Flashcard
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden min-h-[600px]">
          <StudySetFlashcard
            flashcards={studySet.flashcards}
            onExit={() => router.replace(`/study-sets/${id}`)}
            onComplete={() => router.replace(`/study-sets/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
