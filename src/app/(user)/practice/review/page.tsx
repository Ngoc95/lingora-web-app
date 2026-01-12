"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Play, Loader2, Check } from "lucide-react";
import { vocabularyService } from "@/services/vocabulary.service";
import {
  GameType,
  GAME_TYPE_LABELS,
  ProgressSummaryMetaData,
  Word,
} from "@/types/vocabulary";

export default function VocabularyReviewPage() {
  const router = useRouter();

  const [progressSummary, setProgressSummary] =
    useState<ProgressSummaryMetaData | null>(null);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [selectedWordCount, setSelectedWordCount] = useState(10);
  const [selectedGameTypes, setSelectedGameTypes] = useState<Set<GameType>>(
    new Set([
      GameType.SEE_WORD_CHOOSE_MEANING,
      GameType.SEE_MEANING_CHOOSE_WORD,
      GameType.TRUE_FALSE,
    ])
  );

  const wordCountOptions = [5, 10, 15, 20, 30];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, wordsRes] = await Promise.all([
        vocabularyService.getWordStatistics(),
        vocabularyService.getReviewWords({ limit: 50 }),
      ]);
      setProgressSummary(summaryRes.metaData);
      setReviewWords(wordsRes.metaData.words || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleGameType = (type: GameType) => {
    setSelectedGameTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        if (newSet.size > 1) {
          newSet.delete(type);
        }
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleStartReview = () => {
    const gameTypesParam = Array.from(selectedGameTypes).join(",");
    router.push(
      `/practice/review/session?count=${selectedWordCount}&types=${gameTypesParam}`
    );
  };

  const totalLearnedWords = progressSummary?.totalLearnedWord || 0;
  const statistics = progressSummary?.statistics || [];

  // Get SRS data with defaults
  const getSRSData = () => {
    return [1, 2, 3, 4, 5].map((level) => {
      const stat = statistics.find((s) => s.srsLevel === level);
      return { level, count: stat?.wordCount || 0 };
    });
  };

  const srsData = getSRSData();
  const totalWords = srsData.reduce((sum, item) => sum + item.count, 0);

  // Colors for each level
  const levelColors = [
    "from-red-400 to-red-500",
    "from-orange-400 to-orange-500",
    "from-yellow-400 to-yellow-500",
    "from-green-400 to-green-500",
    "from-emerald-500 to-emerald-600",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-32">
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
          <h1 className="text-2xl font-bold text-neutral-900">
            Ôn tập từ vựng
          </h1>
          <p className="text-neutral-600 mt-1">
            Ôn lại từ đã học theo phương pháp SRS
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl">
            {error}
            <button
              onClick={loadData}
              className="ml-4 underline hover:no-underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Progress Summary Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Tổng từ đã học</p>
              <p className="text-2xl font-bold text-neutral-900">
                {totalLearnedWords}
              </p>
            </div>
          </div>

          {/* SRS Level Chart - Bar Chart Style */}
          <div>
            <p className="text-sm text-neutral-600 mb-4">
              Phân bố theo cấp độ SRS
            </p>
            <div className="flex items-end gap-4" style={{ height: "160px" }}>
              {srsData.map((item, idx) => {
                // Calculate height based on total words percentage - use pixels
                const maxBarHeight = 100; // max height in pixels
                const heightPx =
                  totalWords > 0
                    ? Math.max((item.count / totalWords) * maxBarHeight, item.count > 0 ? 20 : 8)
                    : 8;

                // Labels for each level
                const levelLabels = ["Lv1", "Lv2", "Lv3", "Lv4", "Mastered"];

                return (
                  <div
                    key={item.level}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    {/* Count label */}
                    <span className="text-sm font-bold text-neutral-800 mb-2">
                      {item.count}
                    </span>
                    {/* Bar */}
                    <div
                      className={`w-full rounded-lg bg-gradient-to-t ${levelColors[idx]} transition-all shadow-md`}
                      style={{ height: `${heightPx}px` }}
                    />
                    {/* Level label */}
                    <span className={`text-xs font-semibold mt-2 ${idx === 4 ? "text-emerald-600" : "text-neutral-600"}`}>
                      {levelLabels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Word Count Selector - Only show when there are words */}
        {reviewWords.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            <h2 className="font-semibold text-neutral-900 mb-4">
              Số từ muốn ôn tập
            </h2>
            <div className="flex flex-wrap gap-3">
              {wordCountOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedWordCount(count)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedWordCount === count
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {count} từ
                </button>
              ))}
            </div>
            <p className="text-sm text-primary font-medium mt-4">
              Có {reviewWords.length} từ cần ôn tập
            </p>
          </div>
        )}

        {/* Game Type Selector - Only show when there are words */}
        {reviewWords.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            <h2 className="font-semibold text-neutral-900 mb-4">Loại câu hỏi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(GameType).map((type) => {
                const isSelected = selectedGameTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleGameType(type)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                    }`}
                  >
                    <span className="font-medium">{GAME_TYPE_LABELS[type]}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Start Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleStartReview}
            disabled={reviewWords.length === 0}
            className="w-full py-4 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
          >
            <Play className="w-6 h-6" fill="white" />
            {reviewWords.length === 0
              ? "Không có từ cần ôn tập"
              : "Bắt đầu ôn tập"}
          </button>
        </div>
      </div>
    </div>
  );
}
