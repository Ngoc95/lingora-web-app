"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  description: string;
  wordCount: number;
  learnedCount: number;
}

// Mock data
const MOCK_TOPICS: Topic[] = [
  { id: 1, name: "Common Greetings", description: "Basic greetings and introductions", wordCount: 15, learnedCount: 10 },
  { id: 2, name: "Daily Activities", description: "Words for everyday activities", wordCount: 20, learnedCount: 5 },
  { id: 3, name: "Food & Drinks", description: "Common food and beverage vocabulary", wordCount: 25, learnedCount: 0 },
  { id: 4, name: "Family Members", description: "Words for family relationships", wordCount: 12, learnedCount: 12 },
];

export default function CategoryTopicsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Categories</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            Category {categoryId} Topics
          </h1>
          <p className="text-neutral-600 mt-1">
            Select a topic to start learning
          </p>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {MOCK_TOPICS.map((topic) => {
          const progress = topic.wordCount > 0 
            ? (topic.learnedCount / topic.wordCount) * 100 
            : 0;

          return (
            <div
              key={topic.id}
              onClick={() => router.push(`/vocabulary/${categoryId}/${topic.id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-neutral-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {topic.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-neutral-900">
                    {topic.learnedCount}/{topic.wordCount}
                  </div>
                  <div className="text-xs text-neutral-600">words</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-100 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-neutral-600">
                {Math.round(progress)}% complete
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {MOCK_TOPICS.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No topics yet
          </h3>
          <p className="text-neutral-600">
            Topics will appear here once they are added to this category.
          </p>
        </div>
      )}
    </div>
  );
}
