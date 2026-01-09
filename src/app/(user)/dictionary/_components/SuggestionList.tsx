"use client";

import type { Word } from "@/types/vocabulary";

interface SuggestionListProps {
    suggestions: Word[];
    onSuggestionClick: (word: Word) => void;
}

export function SuggestionList({
    suggestions,
    onSuggestionClick,
}: SuggestionListProps) {
    if (suggestions.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 mt-4">
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                    <h3 className="text-sm font-semibold text-neutral-700">
                        Gợi ý
                    </h3>
                </div>
                <div className="divide-y divide-neutral-100">
                    {suggestions.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => onSuggestionClick(word)}
                            className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                        >
                            <div className="flex items-baseline gap-2">
                                <span className="font-medium text-neutral-900">
                                    {word.word}
                                </span>
                                {word.phonetic && (
                                    <span className="text-sm text-primary">{word.phonetic}</span>
                                )}
                            </div>
                            {word.vnMeaning && (
                                <p className="text-sm text-neutral-600 mt-1">
                                    {word.vnMeaning}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
