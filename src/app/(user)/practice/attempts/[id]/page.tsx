"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Minus,
  Trophy,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { examService } from "@/services/exam.service";
import { AttemptDetailResponse, ExamSectionType } from "@/types/exam";

export default function AttemptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = Number(params.id);

  const [detail, setDetail] = useState<AttemptDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (!attemptId) return;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await examService.getAttemptDetail(attemptId);
        setDetail(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load attempt"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [attemptId]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Attempt not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const { attempt, exam, scoreSummary, sections } = detail;

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/practice/tests")}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {exam?.title || `Attempt #${attempt.id}`}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-neutral-600">
            {exam?.examType && (
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
            )}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                attempt.status === "SUBMITTED"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {attempt.status === "SUBMITTED" ? "Hoàn thành" : "Đang làm"}
            </span>
            <span className="text-sm">
              <Clock className="w-4 h-4 inline mr-1" />
              {formatDate(attempt.startedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Score Summary Card - Improved Layout */}
        {scoreSummary && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            {/* Header with gradient */}
            <div 
              className="p-6 text-white"
              style={{ background: "linear-gradient(135deg, #00BC7D 0%, #00BBA7 50%, #00A99D 100%)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Kết quả bài thi</h2>
                  <p className="text-white/80 text-sm">Xem chi tiết điểm số của bạn</p>
                </div>
              </div>

              {/* Main Score Display */}
              <div className="grid grid-cols-3 gap-4">
                {/* Overall Band - Featured */}
                {scoreSummary.bands?.overall !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center">
                    <p className="text-white/80 text-sm mb-2">Overall Band</p>
                    <p className="text-4xl font-bold">
                      {scoreSummary.bands?.overall?.toFixed(1) ?? "0.0"}
                    </p>
                  </div>
                )}

                {/* Correct Answers */}
                {scoreSummary.totals && (
                  <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center">
                    <p className="text-white/80 text-sm mb-2">Số câu đúng</p>
                    <p className="text-4xl font-bold">
                      {scoreSummary.totals.totalCorrect || 0}
                      <span className="text-xl text-white/70">/{scoreSummary.totals.totalQuestions || 0}</span>
                    </p>
                  </div>
                )}

                {/* Total Score */}
                {scoreSummary.totals?.totalScore !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center">
                    <p className="text-white/80 text-sm mb-2">Tổng điểm</p>
                    <p className="text-4xl font-bold">
                      {scoreSummary.totals.totalScore.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section Bands - White background */}
            {scoreSummary.bands && (
              <div className="bg-white p-5">
                <p className="text-neutral-500 text-sm font-medium mb-3 uppercase tracking-wide">Điểm từng phần</p>
                <div className="grid grid-cols-4 gap-3">
                  {scoreSummary.bands?.listening !== undefined && (
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-blue-600 text-xs font-medium mb-1">🎧 Listening</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {scoreSummary.bands?.listening?.toFixed(1) ?? "0.0"}
                      </p>
                    </div>
                  )}
                  {scoreSummary.bands?.reading !== undefined && (
                    <div className="bg-emerald-50 rounded-lg p-4 text-center">
                      <p className="text-emerald-600 text-xs font-medium mb-1">📖 Reading</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {scoreSummary.bands?.reading?.toFixed(1) ?? "0.0"}
                      </p>
                    </div>
                  )}
                  {scoreSummary.bands?.writing !== undefined && (
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-purple-600 text-xs font-medium mb-1">✏️ Writing</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {scoreSummary.bands?.writing?.toFixed(1) ?? "0.0"}
                      </p>
                    </div>
                  )}
                  {scoreSummary.bands?.speaking !== undefined && (
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <p className="text-orange-600 text-xs font-medium mb-1">🎤 Speaking</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {scoreSummary.bands?.speaking?.toFixed(1) ?? "0.0"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sections with Questions */}
        {sections && sections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Chi tiết các phần
            </h2>

            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              const colors = getSectionColor(section.sectionType);

              // Get section score
              const sectionScore = scoreSummary?.sections?.[section.id.toString()];

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${colors.bg} ${colors.text}`}
                      >
                        {section.sectionType}
                      </div>
                      {section.title && (
                        <span className="text-neutral-600">{section.title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {sectionScore && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-primary font-medium">
                            {sectionScore.correct ?? sectionScore.correctCount ?? 0}/
                            {sectionScore.total ?? sectionScore.totalQuestions ?? 0}
                          </span>
                          {sectionScore.band && (
                            <span className="text-neutral-500">
                              (Band {sectionScore.band.toFixed(1)})
                            </span>
                          )}
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 p-4 space-y-4">
                      {section.groups?.map((group) => (
                        <div key={group.id} className="space-y-3">
                          {group.title && (
                            <h4 className="font-medium text-neutral-800">
                              {group.title}
                            </h4>
                          )}

                          {group.questionGroups?.map((qg) => (
                            <div key={qg.id} className="space-y-2">
                              {qg.title && (
                                <p className="text-sm text-neutral-600 font-medium">
                                  {qg.title}
                                </p>
                              )}

                              {qg.questions?.map((q, idx) => (
                                <div
                                  key={q.id || q.questionId || idx}
                                  className={`p-3 rounded-lg border ${
                                    q.isCorrect === true
                                      ? "bg-green-50 border-green-200"
                                      : q.isCorrect === false
                                      ? "bg-red-50 border-red-200"
                                      : "bg-neutral-50 border-neutral-200"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                      {q.isCorrect === true ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      ) : q.isCorrect === false ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                      ) : (
                                        <Minus className="w-5 h-5 text-neutral-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-neutral-800 font-medium">
                                        {idx + 1}. {q.prompt}
                                      </p>
                                      <div className="mt-2 text-sm space-y-1">
                                        <p>
                                          <span className="text-neutral-500">
                                            Câu trả lời của bạn:
                                          </span>{" "}
                                          <span
                                            className={
                                              q.isCorrect === false
                                                ? "text-red-600"
                                                : "text-neutral-700"
                                            }
                                          >
                                            {String(q.userAnswer || "(Không trả lời)")}
                                          </span>
                                        </p>
                                        {q.correctAnswer !== undefined && q.correctAnswer !== null && q.isCorrect === false && (
                                          <p>
                                            <span className="text-neutral-500">
                                              Đáp án đúng:
                                            </span>{" "}
                                            <span className="text-green-600 font-medium">
                                              {String(q.correctAnswer)}
                                            </span>
                                          </p>
                                        )}
                                        {q.explanation && (
                                          <p className="text-neutral-600 italic mt-2">
                                            💡 {q.explanation}
                                          </p>
                                        )}
                                        {q.aiFeedback !== undefined && q.aiFeedback !== null && (
                                          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                            <p className="text-blue-700 text-sm">
                                              🤖 AI Feedback:{" "}
                                              {typeof q.aiFeedback === "string"
                                                ? q.aiFeedback
                                                : JSON.stringify(q.aiFeedback)}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/practice/tests")}
            className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Quay lại danh sách
          </button>
          <button
            onClick={() => router.push(`/practice/tests/${exam?.id}`)}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90"
          >
            Làm lại đề này
          </button>
        </div>
      </div>
    </div>
  );
}
