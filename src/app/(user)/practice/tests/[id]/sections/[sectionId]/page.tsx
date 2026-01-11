"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Send,
  X,
  AlertTriangle,
  Play,
  Pause,
} from "lucide-react";
import { useSectionPractice, useAudioPlayer } from "@/hooks/useExam";
import {
  QuestionRenderer,
  ReadingSection,
  ListeningSection,
  WritingSection,
  SpeakingSection,
} from "@/components/practice";
import { ExamSectionGroup } from "@/types/exam";

function SectionPracticeContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const examId = Number(params.id);
  const sectionId = Number(params.sectionId);
  const mode = (searchParams.get("mode") || "section") as "section" | "full";
  const attemptIdParam = searchParams.get("attemptId");

  const {
    section,
    loading,
    error,
    submitting,
    formattedTime,
    isTimeCritical,
    answers,
    updateAnswer,
    answeredCount,
    totalQuestions,
    currentGroupIndex,
    currentGroup,
    totalGroups,
    isFirstGroup,
    isLastGroup,
    nextGroup,
    prevGroup,
    goToGroup,
    progress,
    submit,
  } = useSectionPractice({
    examId,
    sectionId,
    mode,
    attemptId: attemptIdParam ? Number(attemptIdParam) : null,
  });

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Audio player for Listening sections
  const audio = useAudioPlayer();
  const isListening = section?.sectionType === "LISTENING";
  const audioUrl = isListening ? (currentGroup?.resourceUrl || section?.audioUrl) : null;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => audio.cleanup();
  }, [audio.cleanup]);

  const formatAudioTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleAudioSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audio.duration || !audioUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.seek(percent * audio.duration);
  };

  const handleSubmit = async () => {
    try {
      const resultId = await submit();
      if (mode === "full") {
        router.push(`/practice/tests/${examId}?completedSection=${sectionId}`);
      } else if (resultId) {
        router.push(`/practice/attempts/${resultId}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setShowSubmitDialog(false);
    }
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    if (mode === "full") {
      router.push(`/practice/tests/${examId}`);
    } else {
      router.push("/practice/tests");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Section not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Render section-specific layout
  const renderSectionContent = () => {
    if (!currentGroup) return null;

    switch (section.sectionType) {
      case "READING":
        return (
          <ReadingSection
            group={currentGroup}
            answers={answers}
            onAnswer={updateAnswer}
          />
        );
      case "LISTENING":
        return (
          <ListeningSection
            group={currentGroup}
            answers={answers}
            onAnswer={updateAnswer}
          />
        );
      case "WRITING":
        return (
          <WritingSection
            group={currentGroup}
            answers={answers}
            onAnswer={updateAnswer}
          />
        );
      case "SPEAKING":
        return (
          <SpeakingSection
            group={currentGroup}
            answers={answers}
            onAnswer={updateAnswer}
          />
        );
      default:
        return (
          <GenericSection
            group={currentGroup}
            answers={answers}
            onAnswer={updateAnswer}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Exit button */}
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Thoát</span>
            </button>

            {/* Center: Section title & Timer */}
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-neutral-900 hidden md:block">
                {section.title || section.sectionType}
              </h1>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold ${
                  isTimeCritical 
                    ? "bg-red-100 text-red-600 animate-pulse" 
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Right: Submit button */}
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Nộp bài</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`, 
                  background: "linear-gradient(to right, #00BC7D, #00BBA7)" 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>{answeredCount} / {totalQuestions} câu đã trả lời</span>
              <span>Part {currentGroupIndex + 1} / {totalGroups}</span>
            </div>
          </div>

          {/* Audio Player Bar for Listening sections */}
          {isListening && audioUrl && (
            <div 
              className="mt-3 rounded-lg p-3 flex items-center gap-3"
              style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
            >
              {/* Play/Pause Button */}
              <button
                onClick={() => audio.isPlaying ? audio.pause() : audio.play(audioUrl)}
                className="w-10 h-10 bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform flex-shrink-0"
              >
                {audio.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              {/* Audio Progress */}
              <div className="flex-1">
                <div
                  className="w-full h-2 bg-white/30 rounded-full cursor-pointer overflow-hidden"
                  onClick={handleAudioSeek}
                >
                  <div
                    className="h-full bg-white transition-all"
                    style={{
                      width: audio.duration > 0 ? `${(audio.currentTime / audio.duration) * 100}%` : "0%",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{formatAudioTime(audio.currentTime)}</span>
                  <span>{formatAudioTime(audio.duration || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - with padding for fixed bars */}
      <div className={`flex-1 pb-20 overflow-auto ${isListening && audioUrl ? 'pt-[180px]' : 'pt-[125px]'}`}>
        <div className="max-w-7xl mx-auto px-4">
          {renderSectionContent()}
        </div>
      </div>

      {/* Fixed Bottom Bar - Section Group Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {Array.from({ length: totalGroups }).map((_, idx) => {
              // Check if this group has any answers
              const groupQuestions = section.groups?.[idx]?.questionGroups?.flatMap(
                (qg) => qg.questions.map((q) => q.id)
              ) || [];
              const hasAnswers = groupQuestions.some((id) => answers[id] !== undefined);
              
              return (
                <button
                  key={idx}
                  onClick={() => goToGroup(idx)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm font-semibold transition-all ${
                    idx === currentGroupIndex
                      ? "text-white shadow-lg scale-110"
                      : hasAnswers
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                  style={
                    idx === currentGroupIndex 
                      ? { background: "linear-gradient(to right, #00BC7D, #00BBA7)" }
                      : {}
                  }
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Xác nhận nộp bài
              </h2>
            </div>
            
            <p className="text-neutral-600 mb-2">
              Bạn đã trả lời <span className="font-semibold text-primary">{answeredCount}</span> / {totalQuestions} câu hỏi.
            </p>
            
            {answeredCount < totalQuestions && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-yellow-700 text-sm">
                  Còn {totalQuestions - answeredCount} câu chưa trả lời
                </p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Nộp bài"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Xác nhận thoát
              </h2>
            </div>
            
            <p className="text-neutral-600 mb-4">
              Nếu bạn thoát ngay bây giờ, <span className="font-semibold text-red-600">bài làm sẽ không được lưu</span>.
            </p>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-700 text-sm">
                ⚠️ Bạn đã trả lời {answeredCount} câu. Tất cả tiến độ sẽ bị mất.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
              >
                Tiếp tục làm
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Generic section for fallback
function GenericSection({
  group,
  answers,
  onAnswer,
}: {
  group: ExamSectionGroup;
  answers: { [questionId: number]: unknown };
  onAnswer: (questionId: number, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      {group.title && (
        <h2 className="font-semibold text-neutral-900 text-lg">{group.title}</h2>
      )}
      {group.description && (
        <p className="text-neutral-600">{group.description}</p>
      )}
      {group.content && (
        <div
          className="prose prose-neutral max-w-none bg-white rounded-xl p-6 shadow-sm border border-neutral-100"
          dangerouslySetInnerHTML={{ __html: group.content }}
        />
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
        <div className="space-y-6">
          {group.questionGroups?.map((qg, qgIdx) => (
            <div key={qg.id} className="space-y-4">
              {qg.title && (
                <h4 className="font-medium text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg">
                  {qg.title}
                </h4>
              )}
              <div className="space-y-6">
                {qg.questions.map((q, idx) => {
                  let num = 1;
                  for (let i = 0; i < qgIdx; i++) {
                    num += group.questionGroups?.[i]?.questions.length || 0;
                  }
                  return (
                    <QuestionRenderer
                      key={q.id}
                      question={q}
                      index={num + idx}
                      answer={answers[q.id]}
                      onAnswer={(value) => onAnswer(q.id, value)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export default function SectionPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SectionPracticeContent />
    </Suspense>
  );
}
