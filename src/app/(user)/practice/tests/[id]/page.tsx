"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Check,
  Play,
  Loader2,
} from "lucide-react";
import { examService } from "@/services/exam.service";
import { Exam, ExamSection, ExamSectionType, ExamAttempt } from "@/types/exam";

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examId = Number(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Full test mode state
  const [isFullMode, setIsFullMode] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [startingFull, setStartingFull] = useState(false);
  const [submittingFull, setSubmittingFull] = useState(false);

  useEffect(() => {
    if (!examId) return;

    const loadExam = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await examService.getExamDetail(examId);
        setExam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  const getSectionIcon = (type: ExamSectionType) => {
    switch (type) {
      case "LISTENING":
        return Headphones;
      case "READING":
        return BookOpen;
      case "WRITING":
        return PenTool;
      case "SPEAKING":
        return Mic;
      default:
        return BookOpen;
    }
  };

  const getSectionColor = (type: ExamSectionType) => {
    switch (type) {
      case "LISTENING":
        return { bg: "bg-blue-100", text: "text-blue-600" };
      case "READING":
        return { bg: "bg-green-100", text: "text-green-600" };
      case "WRITING":
        return { bg: "bg-purple-100", text: "text-purple-600" };
      case "SPEAKING":
        return { bg: "bg-orange-100", text: "text-orange-600" };
      default:
        return { bg: "bg-neutral-100", text: "text-neutral-600" };
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} phút`;
  };

  const getTotalDuration = () => {
    if (!exam) return "";
    const totalSeconds = exam.sections.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} phút`;
  };

  const handleStartFullTest = async () => {
    if (!exam) return;
    setStartingFull(true);
    try {
      const attempt = await examService.startExamAttempt(exam.id, {
        mode: "FULL",
        resumeLast: true,
      });
      setCurrentAttempt(attempt);
      setIsFullMode(true);
      setCompletedSections(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start test");
    } finally {
      setStartingFull(false);
    }
  };

  const handleStartSection = (section: ExamSection) => {
    if (!exam) return;
    // Navigate to section practice page
    router.push(
      `/practice/tests/${exam.id}/sections/${section.id}?mode=${
        isFullMode ? "full" : "section"
      }${currentAttempt ? `&attemptId=${currentAttempt.id}` : ""}`
    );
  };

  const handleSubmitFullTest = async () => {
    if (!currentAttempt) return;
    setSubmittingFull(true);
    try {
      await examService.submitExamAttempt(currentAttempt.id);
      router.push(`/practice/attempts/${currentAttempt.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit test");
    } finally {
      setSubmittingFull(false);
    }
  };

  const handleExitFullMode = () => {
    if (completedSections.size > 0) {
      if (!confirm("Thoát sẽ mất tiến độ đang làm. Bạn có chắc chắn muốn thoát?")) {
        return;
      }
    }
    setIsFullMode(false);
    setCurrentAttempt(null);
    setCompletedSections(new Set());
  };

  const getNextSection = (): ExamSection | null => {
    if (!exam) return null;
    return (
      exam.sections.find((s) => !completedSections.has(s.id)) || null
    );
  };

  const allSectionsCompleted =
    exam && completedSections.size === exam.sections.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Exam not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => (isFullMode ? handleExitFullMode() : router.back())}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">{exam.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-neutral-600">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                exam.examType === "IELTS"
                  ? "bg-blue-100 text-blue-700"
                  : exam.examType === "TOEIC"
                  ? "bg-green-100 text-green-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {exam.examType}
            </span>
            <span className="text-sm">{exam.code}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-lg font-semibold text-purple-700">
              {getTotalDuration()}
            </span>
          </div>

          {/* Start Full Test Button */}
          {exam.sections.length >= 2 && !isFullMode && (
            <button
              onClick={handleStartFullTest}
              disabled={startingFull}
              className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {startingFull ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Bắt đầu Full Test
            </button>
          )}
        </div>

        {/* Full Mode Progress */}
        {isFullMode && (
          <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Full Test Progress
            </h2>
            <div className="space-y-3">
              {exam.sections.map((section, idx) => {
                const isCompleted = completedSections.has(section.id);
                const isNext = getNextSection()?.id === section.id;
                const colors = getSectionColor(section.sectionType);

                return (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      isCompleted
                        ? "bg-green-50"
                        : isNext
                        ? "bg-yellow-50"
                        : "bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Number badge */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isNext
                            ? "bg-yellow-500 text-white"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="font-medium text-neutral-900">
                        {section.sectionType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500">
                        {isCompleted ? "Hoàn thành" : "Chưa làm"}
                      </span>
                      <button
                        onClick={() => handleStartSection(section)}
                        disabled={!isNext}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isNext
                            ? "bg-primary text-white hover:opacity-90"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        Làm
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExitFullMode}
                className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Thoát
              </button>
              <button
                onClick={handleSubmitFullTest}
                disabled={!allSectionsCompleted || submittingFull}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  allSectionsCompleted
                    ? "bg-gradient-primary text-white hover:opacity-90"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                {submittingFull ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Hoàn thành"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Section Mode - Choose Section */}
        {!isFullMode && (
          <>
            <h2 className="text-lg font-semibold text-neutral-900">
              Chọn kỹ năng để luyện tập
            </h2>
            <div className="space-y-4">
              {exam.sections.map((section) => {
                const Icon = getSectionIcon(section.sectionType);
                const colors = getSectionColor(section.sectionType);

                return (
                  <div
                    key={section.id}
                    onClick={() => handleStartSection(section)}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}
                      >
                        <Icon className={`w-7 h-7 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                            {section.sectionType}
                          </h3>
                          {section.status === "COMPLETED" && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        {section.title && (
                          <p className="text-neutral-600 text-sm">
                            {section.title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(section.durationSeconds)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
