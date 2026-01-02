"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/vocabulary/CategoryCard";
import { vocabularyService } from "@/services/vocabulary.service";
import type { CategoryProgress, ProgressSummaryMetaData } from "@/types/vocabulary";

// Mock data for development
const MOCK_CATEGORIES: CategoryProgress[] = [
  {
    id: 1,
    name: "Giao tiếp cơ bản",
    description: "Từ vựng cần thiết cho giao tiếp hàng ngày",
    totalTopics: 12,
    completedTopics: 5,
    progressPercent: 41.7,
    completed: false,
  },
  {
    id: 2,
    name: "Du lịch",
    description: "Từ vựng dùng khi đi du lịch nước ngoài",
    totalTopics: 8,
    completedTopics: 2,
    progressPercent: 25,
    completed: false,
  },
  {
    id: 3,
    name: "Công việc - Văn phòng",
    description: "Từ vựng trong môi trường công sở",
    totalTopics: 15,
    completedTopics: 10,
    progressPercent: 66.7,
    completed: false,
  },
  {
    id: 4,
    name: "Ẩm thực",
    description: "Từ vựng về ăn uống, nấu ăn",
    totalTopics: 10,
    completedTopics: 10,
    progressPercent: 100,
    completed: true,
  },
  {
    id: 5,
    name: "Sức khỏe",
    description: "Từ vựng y tế, bệnh viện, chăm sóc sức khỏe",
    totalTopics: 7,
    completedTopics: 0,
    progressPercent: 0,
    completed: false,
  },
  {
    id: 6,
    name: "Giáo dục",
    description: "Từ vựng học tập, trường học",
    totalTopics: 11,
    completedTopics: 3,
    progressPercent: 27.3,
    completed: false,
  },
];

export default function VocabularyPage() {
  const [categories, setCategories] = useState<CategoryProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalLearned, setTotalLearned] = useState<number>(0);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 3x3 grid
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await vocabularyService.getCategories({
          search: searchQuery || undefined,
          page,
          limit,
        });
        const data = categoriesRes.metaData;
        setCategories(data.categories);
        setTotalPages(data.totalPages || 1);

        // Fetch statistics
        const statsRes = await vocabularyService.getWordStatistics();
        setTotalLearned(statsRes.metaData.totalLearnedWord || 0);
      } catch {
        // Use mock data on error
        console.log("Using mock data");
        setCategories(
          searchQuery
            ? MOCK_CATEGORIES.filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : MOCK_CATEGORIES
        );
        setTotalPages(1);
        setTotalLearned(156);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
          Học từ vựng
        </h1>
        <p className="text-[var(--neutral-600)]">
          Chọn danh mục để bắt đầu học
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Tổng từ đã học</p>
            <p className="text-2xl font-bold">{totalLearned} từ</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" />
        <Input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // Reset to page 1 on search
          }}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-[var(--neutral-100)] animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--neutral-600)]">
            Không tìm thấy danh mục nào
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                href={`/vocabulary/category/${category.id}`}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-[var(--neutral-200)]">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="text-sm font-medium text-[var(--neutral-600)]">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
