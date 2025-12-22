"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const GAME_TYPES = [
  { id: "listen-fill", label: "Listen & Fill", icon: "🎧" },
  { id: "listen-choose", label: "Listen & Choose", icon: "🔊" },
  { id: "true-false", label: "True/False", icon: "✓✗" },
  { id: "word-meaning", label: "See Word → Choose Meaning", icon: "📖" },
  { id: "meaning-word", label: "See Meaning → Choose Word", icon: "🔤" },
];

const WORD_COUNTS = [10, 15, 20, 25, 30];

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const topicId = params.topicId as string;

  const [selectedWordCount, setSelectedWordCount] = useState(15);
  const [selectedGameTypes, setSelectedGameTypes] = useState<string[]>([
    "listen-fill",
    "listen-choose",
    "word-meaning",
  ]);

  const toggleGameType = (gameTypeId: string) => {
    if (selectedGameTypes.includes(gameTypeId)) {
      setSelectedGameTypes(selectedGameTypes.filter((id) => id !== gameTypeId));
    } else {
      setSelectedGameTypes([...selectedGameTypes, gameTypeId]);
    }
  };

  const handleStartLearning = () => {
    // TODO: Pass selected options to learning page
    router.push(`/learn/${topicId}?count=${selectedWordCount}&games=${selectedGameTypes.join(",")}`);
  };

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Topics</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            Topic {topicId}
          </h1>
          <p className="text-neutral-600 mt-1">
            Configure your learning session
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            About this topic
          </h2>
          <p className="text-neutral-600">
            This topic contains essential vocabulary words. Select your preferences below to customize your learning experience.
          </p>
        </div>

        {/* Word Count Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Number of Words
          </h2>
          <div className="flex flex-wrap gap-3">
            {WORD_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setSelectedWordCount(count)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedWordCount === count
                    ? "bg-gradient-primary text-white shadow-md"
                    : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Game Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Game Types
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Select at least one game type to practice with
          </p>
          <div className="space-y-3">
            {GAME_TYPES.map((gameType) => {
              const isSelected = selectedGameTypes.includes(gameType.id);
              return (
                <button
                  key={gameType.id}
                  onClick={() => toggleGameType(gameType.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-neutral-100 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-neutral-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-2xl mr-2">{gameType.icon}</span>
                    <span className="font-medium text-neutral-900">{gameType.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartLearning}
          disabled={selectedGameTypes.length === 0}
          className="w-full bg-gradient-primary text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Start Learning ({selectedWordCount} words)
        </button>
      </div>
    </div>
  );
}
