"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Volume2 } from "lucide-react";

interface DictionaryEntry {
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  vnMeaning: string;
  example?: string;
  audioUrl?: string;
}

const MOCK_RESULTS: DictionaryEntry[] = [
  {
    word: "hello",
    phonetic: "/həˈloʊ/",
    type: "interjection",
    meaning: "used as a greeting or to begin a phone conversation",
    vnMeaning: "xin chào",
    example: "Hello, how are you?",
  },
];

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    // TODO: Call dictionary API
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">Dictionary</h1>
          <p className="text-neutral-600 mt-1">
            Look up word definitions and meanings
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Enter a word to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-neutral-600 mt-4">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((entry, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-bold text-neutral-900">{entry.word}</h2>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Volume2 className="w-6 h-6 text-primary" />
                  </button>
                </div>
                <div className="mb-4">
                  <span className="text-neutral-600">{entry.phonetic}</span>
                  <span className="mx-2 text-neutral-300">•</span>
                  <span className="text-primary font-medium">{entry.type}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 mb-1">English:</p>
                    <p className="text-neutral-700">{entry.meaning}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 mb-1">Vietnamese:</p>
                    <p className="text-neutral-700">{entry.vnMeaning}</p>
                  </div>
                  {entry.example && (
                    <div className="bg-neutral-100/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-neutral-900 mb-1">Example:</p>
                      <p className="text-neutral-700 italic">{entry.example}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No results found
            </h3>
            <p className="text-neutral-600">
              Try searching for a different word
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Start searching
            </h3>
            <p className="text-neutral-600">
              Enter a word above to look up its definition
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
