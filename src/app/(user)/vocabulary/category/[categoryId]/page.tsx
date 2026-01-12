"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TopicCard } from "@/components/vocabulary/TopicCard";
import { vocabularyService } from "@/services/vocabulary.service";
import type { TopicProgress } from "@/types/vocabulary";

// Mock data for development
const MOCK_CATEGORY = {
  id: 1,
  name: "Giao tiếp cơ bản",
  description: "Từ vựng cần thiết cho giao tiếp hàng ngày",
  totalTopics: 12,
  completedTopics: 5,
  progressPercent: 41.7,
  completed: false,
};

const MOCK_TOPICS: TopicProgress[] = [
  { id: 1, name: "Chào hỏi", description: "Các cách chào hỏi cơ bản", totalWords: 25, learnedWords: 25, completed: true },
  { id: 2, name: "Giới thiệu bản thân", description: "Từ vựng giới thiệu", totalWords: 30, learnedWords: 15, completed: false },
  { id: 3, name: "Gia đình", description: "Từ vựng về gia đình", totalWords: 40, learnedWords: 10, completed: false },
  { id: 4, name: "Số đếm", description: "Các số và cách đếm", totalWords: 50, learnedWords: 50, completed: true },
  { id: 5, name: "Màu sắc", description: "Từ vựng về màu sắc", totalWords: 20, learnedWords: 5, completed: false },
  { id: 6, name: "Ngày tháng", description: "Ngày, tháng, năm", totalWords: 35, learnedWords: 0, completed: false },
];

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params.categoryId);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);
  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await vocabularyService.getCategoryTopics(categoryId, {
          search: searchQuery || undefined,
        });
        const data = res.metaData;
        setCategoryName(data.name);
        setCategoryDescription(data.description);
        setProgressPercent(data.progressPercent);
        setCompletedTopics(data.completedTopics);
        setTotalTopics(data.totalTopics);
        setTopics(data.topics);
      } catch {
        // Use mock data on error
        console.log("Using mock data");
        setCategoryName(MOCK_CATEGORY.name);
        setCategoryDescription(MOCK_CATEGORY.description);
        setProgressPercent(MOCK_CATEGORY.progressPercent);
        setCompletedTopics(MOCK_CATEGORY.completedTopics);
        setTotalTopics(MOCK_CATEGORY.totalTopics);
        setTopics(
          searchQuery
            ? MOCK_TOPICS.filter((t) =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : MOCK_TOPICS
        );
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [categoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Back Button + Header */}
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
            {categoryName || "Đang tải..."}
          </h1>
          <p className="text-neutral-600 mt-1">
            {categoryDescription}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-600">
              Tiến độ danh mục
            </span>
            <span className="text-sm font-medium text-primary-500">
              {completedTopics}/{totalTopics} chủ đề hoàn thành
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="mt-2 text-right text-sm text-neutral-600">
            {progressPercent.toFixed(1)}%
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white"
          />
        </div>

        {/* Topics Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">
              Không tìm thấy chủ đề nào
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                href={`/vocabulary/category/${categoryId}/topic/${topic.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
