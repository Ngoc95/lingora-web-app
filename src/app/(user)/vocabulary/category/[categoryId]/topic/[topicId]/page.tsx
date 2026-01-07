"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { WordCountSelector } from "@/components/learn/WordCountSelector";
import { GameTypeSelector } from "@/components/learn/GameTypeSelector";
import { vocabularyService } from "@/services/vocabulary.service";
import { GameType, WordStatus } from "@/types/vocabulary";
import type { WordWithProgress } from "@/types/vocabulary";

// Mock data removed

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params.categoryId);
  const topicId = Number(params.topicId);

  const [topicName, setTopicName] = useState("Chủ đề");
  const [totalWords, setTotalWords] = useState(0);
  const [learnedWords, setLearnedWords] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [words, setWords] = useState<WordWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<boolean | null>(null);

  // Learning config
  const [selectedWordCount, setSelectedWordCount] = useState(10);
  const [selectedGameTypes, setSelectedGameTypes] = useState<Set<GameType>>(
    new Set([GameType.SEE_WORD_CHOOSE_MEANING, GameType.SEE_MEANING_CHOOSE_WORD])
  );

  const unlearned = totalWords - learnedWords;
  const canStartLearning = selectedGameTypes.size >= 2 && unlearned > 0;

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryName, setCategoryName] = useState("");

  // Fetch Category and Topic Info
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        // Fetch with a high limit to try to find the topic name
        const res = await vocabularyService.getCategoryTopics(categoryId, { limit: 100 });
        const data = res.metaData;
        setCategoryName(data.name);
        const foundTopic = data.topics.find((t) => t.id === topicId);
        if (foundTopic) {
          setTopicName(foundTopic.name);
        }
      } catch (error) {
        console.error("Failed to fetch category info", error);
      }
    };

    if (categoryId) {
      fetchCategoryInfo();
    }
  }, [categoryId, topicId]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await vocabularyService.getTopicWords(topicId, {
          hasLearned: filter,
          page,
          limit,
        });
        const data = res.metaData;
        setTotalWords(data.totalWordsAll);
        setLearnedWords(data.learnedCountAll);
        setProgressPercent(data.progressPercent);
        setWords(data.words);
        setTotalPages(data.totalPages || 1);
        // Do not overwrite topicName here as we fetch it separately
      } catch (error) {
        console.error("Failed to fetch topic data", error);
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId, filter, page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleStartLearning = () => {
    const gameTypesStr = Array.from(selectedGameTypes).join(",");
    router.push(
      `/learn/${topicId}?wordCount=${selectedWordCount}&gameTypes=${gameTypesStr}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[var(--neutral-600)] hover:text-[var(--primary-500)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
              {topicName}
            </h1>
            <p className="text-[var(--neutral-600)]">
              {learnedWords}/{totalWords} từ đã học
            </p>
          </div>
          {/* Circular Progress */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32" cy="32" r="28"
                stroke="var(--neutral-200)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32" cy="32" r="28"
                stroke="var(--primary-500)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(progressPercent / 100) * 176} 176`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--primary-500)]">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="learn" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Học từ
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Danh sách từ
          </TabsTrigger>
        </TabsList>

        {/* Learn Tab */}
        <TabsContent value="learn" className="mt-6 space-y-6">
          {unlearned === 0 ? (
            <div className="text-center py-12 bg-[var(--success)]/10 rounded-xl">
              <p className="text-lg font-medium text-[var(--success)]">
                🎉 Bạn đã học hết tất cả từ trong chủ đề này!
              </p>
            </div>
          ) : (
            <>
              <WordCountSelector
                value={selectedWordCount}
                onChange={setSelectedWordCount}
                maxAvailable={unlearned}
              />

              <GameTypeSelector
                selectedTypes={selectedGameTypes}
                onChange={setSelectedGameTypes}
              />

              <button
                type="button"
                onClick={handleStartLearning}
                disabled={!canStartLearning}
                className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 bg-[var(--primary-500)] text-white hover:bg-[var(--primary-500)]/90 disabled:bg-[var(--neutral-200)] disabled:text-[var(--neutral-400)] disabled:cursor-not-allowed"
              >
                Bắt đầu học
              </button>
            </>
          )}
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="mt-6 space-y-4">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Tất cả", value: null },
              { label: "Đã học", value: true },
              { label: "Chưa học", value: false },
            ].map((item) => (
              <button
                key={String(item.value)}
                onClick={() => setFilter(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === item.value
                    ? "bg-[var(--primary-500)] text-white"
                    : "bg-[var(--neutral-100)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Word List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-[var(--neutral-100)] animate-pulse" />
              ))}
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--neutral-600)]">Không có từ nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {words.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-white border border-[var(--neutral-200)] shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--neutral-900)]">
                            {w.word}
                          </span>
                          {w.phonetic && (
                            <span className="text-sm text-[var(--neutral-600)]">
                              {w.phonetic}
                            </span>
                          )}
                          {w.type && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[var(--neutral-600)]">
                              {w.type}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--neutral-600)] mt-1">
                          {w.vnMeaning || w.meaning}
                        </p>
                      </div>
                      {w.progress ? (
                        <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] font-medium">
                          Đã học
                        </span>
                      ) : (
                        <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-[var(--neutral-100)] text-[var(--neutral-600)]">
                          Chưa học
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[var(--neutral-200)]">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
