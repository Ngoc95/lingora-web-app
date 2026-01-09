"use client";

import { useState, useCallback, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudySetList } from "@/hooks/useStudySet";
import { StudySetCard } from "@/components/studysets";
import type { StudySet } from "@/types/studySet";

type TabType = "all" | "my";

export default function StudySetsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchInput, setSearchInput] = useState("");

  const {
    studySets,
    currentPage,
    totalPages,
    isLoading,
    error,
    setSearch,
    setPage,
  } = useStudySetList({ tab: activeTab });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchInput("");
    setSearch("");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-50)] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[var(--neutral-200)]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
                Học liệu
              </h1>
              <p className="text-[var(--neutral-600)] mt-1">
                Khám phá và tạo bộ flashcard & quiz
              </p>
            </div>
            <button
              onClick={() => router.push("/study-sets/create")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Tạo mới
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "Tất cả" },
              { id: "my", label: "Của tôi" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-[var(--primary-500)] text-white"
                    : "bg-[var(--neutral-100)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" />
          <input
            type="text"
            placeholder="Tìm kiếm học liệu..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[var(--neutral-200)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
          />
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-[var(--error)] mb-4">
              Có lỗi xảy ra khi tải dữ liệu
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Study Sets Grid */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studySets.map((studySet: StudySet) => (
                <StudySetCard
                  key={studySet.id}
                  studySet={studySet}
                  onClick={() => router.push(`/study-sets/${studySet.id}`)}
                />
              ))}
            </div>

            {/* Empty State */}
            {studySets.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-[var(--neutral-900)] mb-2">
                  Không có học liệu nào
                </h3>
                <p className="text-[var(--neutral-600)] mb-6">
                  {activeTab === "my"
                    ? "Bạn chưa tạo học liệu nào"
                    : "Hãy thử tìm kiếm với từ khóa khác"}
                </p>
                {activeTab === "my" && (
                  <button
                    onClick={() => router.push("/study-sets/create")}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Tạo học liệu đầu tiên
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    currentPage === 1
                      ? "text-[var(--neutral-400)] cursor-not-allowed"
                      : "text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]"
                  )}
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-[var(--neutral-600)]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    currentPage === totalPages
                      ? "text-[var(--neutral-400)] cursor-not-allowed"
                      : "text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]"
                  )}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
