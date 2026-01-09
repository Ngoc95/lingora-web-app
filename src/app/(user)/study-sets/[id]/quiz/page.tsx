"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStudySetDetail } from "@/hooks/useStudySet";
import { StudySetQuiz } from "@/components/studysets";

export default function QuizModePage() {
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

  if (error || !studySet || studySet.quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <p className="text-[var(--neutral-600)]">Không có câu hỏi quiz nào</p>
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
      <StudySetQuiz
        quizzes={studySet.quizzes}
        onExit={() => router.replace(`/study-sets/${id}`)}
        onComplete={() => router.replace(`/study-sets/${id}`)}
      />
    </div>
  );
}
