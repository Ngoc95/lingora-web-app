"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStudySetDetail } from "@/hooks/useStudySet";
import { StudySetFlashcard } from "@/components/studysets";

export default function FlashcardModePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { studySet, isLoading, error } = useStudySetDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
      </div>
    );
  }

  if (error || !studySet || studySet.flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-[var(--neutral-600)]">Không có flashcard nào</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <StudySetFlashcard
        flashcards={studySet.flashcards}
        onExit={() => router.replace(`/study-sets/${id}`)}
        onComplete={() => router.replace(`/study-sets/${id}`)}
      />
    </div>
  );
}
