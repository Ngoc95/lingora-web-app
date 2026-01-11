"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { examService } from "@/services/exam.service";
import { Exam, ExamAttempt, ExamType } from "@/types/exam";

type Tab = "exams" | "history";

export default function TestsListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("exams");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ExamType | "all">("all");

  // Exams state
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsPage, setExamsPage] = useState(1);
  const [examsTotalPages, setExamsTotalPages] = useState(1);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState<string | null>(null);

  // Attempts state
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [attemptsTotalPages, setAttemptsTotalPages] = useState(1);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  // Refs for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch exams
  const fetchExams = useCallback(
    async (page: number, reset = false) => {
      if (examsLoading) return;
      setExamsLoading(true);
      setExamsError(null);
      try {
        const response = await examService.listExams({
          page,
          limit: 10,
          examType: selectedType === "all" ? undefined : selectedType,
          search: searchTerm || undefined,
        });
        setExams((prev) => (reset ? response.exams : [...prev, ...response.exams]));
        setExamsPage(response.currentPage);
        setExamsTotalPages(response.totalPages);
      } catch (err) {
        setExamsError(err instanceof Error ? err.message : "Failed to load exams");
      } finally {
        setExamsLoading(false);
      }
    },
    [selectedType, searchTerm, examsLoading]
  );

  // Fetch attempts
  const fetchAttempts = useCallback(
    async (page: number, reset = false) => {
      if (attemptsLoading) return;
      setAttemptsLoading(true);
      setAttemptsError(null);
      try {
        const response = await examService.listAttempts({ page, limit: 20 });
        setAttempts((prev) =>
          reset ? response.attempts : [...prev, ...response.attempts]
        );
        setAttemptsPage(response.currentPage);
        setAttemptsTotalPages(response.totalPages);
      } catch (err) {
        setAttemptsError(
          err instanceof Error ? err.message : "Failed to load history"
        );
      } finally {
        setAttemptsLoading(false);
      }
    },
    [attemptsLoading]
  );

  // Initial load & filter changes
  useEffect(() => {
    if (activeTab === "exams") {
      setExams([]);
      fetchExams(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedType, searchTerm]);

  useEffect(() => {
    if (activeTab === "history" && attempts.length === 0) {
      fetchAttempts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (activeTab === "exams" && examsPage < examsTotalPages && !examsLoading) {
            fetchExams(examsPage + 1);
          } else if (
            activeTab === "history" &&
            attemptsPage < attemptsTotalPages &&
            !attemptsLoading
          ) {
            fetchAttempts(attemptsPage + 1);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [
    activeTab,
    examsPage,
    examsTotalPages,
    examsLoading,
    attemptsPage,
    attemptsTotalPages,
    attemptsLoading,
    fetchExams,
    fetchAttempts,
  ]);

  const getExamColor = (type: ExamType) => {
    switch (type) {
      case "IELTS":
        return "bg-blue-100 text-blue-700";
      case "TOEIC":
        return "bg-green-100 text-green-700";
      case "TOEFL":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const formatDuration = (sections: Exam["sections"]) => {
    const totalSeconds = sections.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} phút`;
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

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/practice")}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">Luyện đề thi</h1>
          <p className="text-neutral-600 mt-1">
            Luyện đề thi IELTS
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-neutral-100 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("exams")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "exams"
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Luyện đề thi
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Lịch sử làm bài
            </button>
          </div>
        </div>

        {activeTab === "exams" && (
          <>
            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đề thi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ExamType | "all")}
                  className="px-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">Tất cả</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="TOEFL">TOEFL</option>
                </select>
              </div>
            </div>

            {/* Exams List */}
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => router.push(`/practice/tests/${exam.id}`)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getExamColor(
                            exam.examType
                          )}`}
                        >
                          {exam.examType}
                        </span>
                        <span className="text-sm text-neutral-500">{exam.code}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                        {exam.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(exam.sections)}</span>
                        </div>
                        <span>{exam.sections.length} phần thi</span>
                      </div>
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exam.sections.map((section) => (
                          <span
                            key={section.id}
                            className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg"
                          >
                            {section.sectionType}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {examsLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {/* Error state */}
              {examsError && (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{examsError}</p>
                  <button
                    onClick={() => fetchExams(1, true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!examsLoading && exams.length === 0 && !examsError && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Không tìm thấy đề thi
                  </h3>
                  <p className="text-neutral-600">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                onClick={() => router.push(`/practice/attempts/${attempt.id}`)}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                    {attempt.examTitle || `Attempt #${attempt.id}`}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      attempt.status === "SUBMITTED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {attempt.status === "SUBMITTED" ? "Hoàn thành" : "Đang làm"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                  <span>Chế độ: {attempt.mode === "FULL" ? "Full Test" : "Section"}</span>
                  {attempt.startedAt && (
                    <span>Bắt đầu: {formatDate(attempt.startedAt)}</span>
                  )}
                  {attempt.scoreSummary?.overallBand && (
                    <span className="text-primary font-semibold">
                      Band: {attempt.scoreSummary.overallBand}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {attemptsLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {/* Error state */}
            {attemptsError && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{attemptsError}</p>
                <button
                  onClick={() => fetchAttempts(1, true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty state */}
            {!attemptsLoading && attempts.length === 0 && !attemptsError && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Chưa có lịch sử làm bài
                </h3>
                <p className="text-neutral-600">
                  Hãy bắt đầu luyện tập với một đề thi!
                </p>
                <button
                  onClick={() => setActiveTab("exams")}
                  className="mt-4 px-6 py-2 bg-gradient-primary text-white rounded-lg font-medium"
                >
                  Bắt đầu luyện đề
                </button>
              </div>
            )}
          </div>
        )}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-4" />
      </div>
    </div>
  );
}
