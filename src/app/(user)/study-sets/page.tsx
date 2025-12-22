"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";

interface StudySet {
  id: number;
  title: string;
  description: string;
  cardCount: number;
  price: number;
  owner: { username: string };
  likeCount: number;
  isPurchased: boolean;
}

const MOCK_STUDYSETS: StudySet[] = [
  { id: 1, title: "English Vocabulary 500", description: "Learn 500 common English words", cardCount: 50, price: 0, owner: { username: "john_doe" }, likeCount: 125, isPurchased: false },
  { id: 2, title: "IELTS Academic Words", description: "Essential vocabulary for IELTS", cardCount: 100, price: 50000, owner: { username: "teacher_jane" }, likeCount: 89, isPurchased: true },
  { id: 3, title: "Business English", description: "Professional vocabulary", cardCount: 75, price: 30000, owner: { username: "biz_expert" }, likeCount: 56, isPurchased: false },
];

export default function StudySetsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "purchased">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSets = MOCK_STUDYSETS.filter((set) => {
    const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "my") return false; // Mock: no owned sets
    if (activeTab === "purchased") return set.isPurchased && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Study Sets</h1>
              <p className="text-neutral-600 mt-1">
                Browse and create flashcard sets
              </p>
            </div>
            <button
              onClick={() => router.push("/study-sets/create")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "my", label: "My Sets" },
              { id: "purchased", label: "Purchased" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search study sets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Study Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSets.map((set) => (
            <div
              key={set.id}
              onClick={() => router.push(`/study-sets/${set.id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  📚
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                    {set.title}
                  </h3>
                  <p className="text-sm text-neutral-600">by @{set.owner.username}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                {set.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{set.cardCount} cards</span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600">❤️ {set.likeCount}</span>
                  <span className="font-semibold text-primary">
                    {set.price === 0 ? "FREE" : `${set.price.toLocaleString()}đ`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No study sets found
            </h3>
            <p className="text-neutral-600 mb-4">
              {activeTab === "my" 
                ? "You haven't created any study sets yet"
                : "Try adjusting your search criteria"}
            </p>
            {activeTab === "my" && (
              <button
                onClick={() => router.push("/study-sets/create")}
                className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Create Your First Set
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
