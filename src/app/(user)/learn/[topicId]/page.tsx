"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Volume2, X } from "lucide-react";

interface Word {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  vnMeaning: string;
  audioUrl?: string;
}

// Mock words
const MOCK_WORDS: Word[] = [
  { id: 1, word: "hello", phonetic: "/həˈloʊ/", meaning: "a greeting", vnMeaning: "xin chào" },
  { id: 2, word: "goodbye", phonetic: "/ɡʊdˈbaɪ/", meaning: "a parting phrase", vnMeaning: "tạm biệt" },
  { id: 3, word: "thank you", phonetic: "/θæŋk juː/", meaning: "expression of gratitude", vnMeaning: "cảm ơn" },
];

type GameType = "listen-fill" | "listen-choose" | "true-false" | "word-meaning" | "meaning-word";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = params.topicId as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const totalWords = MOCK_WORDS.length;
  const currentWord = MOCK_WORDS[currentIndex];
  const progress = ((currentIndex + 1) / totalWords) * 100;

  // Mock game type (in real app, this would cycle through selected game types)
  const currentGameType: GameType = "word-meaning";

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Completed all words
      router.push(`/vocabulary`);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleExit = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary-light/10 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExit}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-neutral-600">
                {currentIndex + 1} / {totalWords}
              </span>
            </div>
            <div className="text-sm font-medium text-primary">
              Topic {topicId}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {currentGameType === "word-meaning" && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Word Display */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold text-neutral-900">
                    {currentWord.word}
                  </h2>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Volume2 className="w-6 h-6 text-primary" />
                  </button>
                </div>
                <p className="text-neutral-600">{currentWord.phonetic}</p>
              </div>

              {/* Question */}
              <p className="text-lg font-medium text-neutral-900 mb-6 text-center">
                Choose the correct meaning:
              </p>

              {/* Options */}
              <div className="space-y-3">
                {[currentWord.vnMeaning, "nghĩa sai 1", "nghĩa sai 2", "nghĩa sai 3"].map((option, index) => {
                  const isCorrect = index === 0;
                  const isSelected = selectedAnswer === index;
                  const showResult = showFeedback && isSelected;

                  return (
                    <button
                      key={index}
                      onClick={() => !showFeedback && handleAnswer(index)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        showResult
                          ? isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-neutral-100 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-900 font-medium">{option}</span>
                        {showResult && (
                          <span className="text-2xl">
                            {isCorrect ? "✓" : "✗"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Skip Button */}
              {!showFeedback && (
                <button
                  onClick={handleSkip}
                  className="w-full mt-6 py-3 text-neutral-600 hover:text-primary transition-colors"
                >
                  Skip
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
