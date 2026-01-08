"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ModeToggle } from "./_components/ModeToggle";
import { DictionarySearchCard } from "./_components/DictionarySearchCard";
import { SuggestionList } from "./_components/SuggestionList";
import { WordResultCard } from "./_components/WordResultCard";
import { dictionaryService } from "@/services/dictionary.service";
import type { Word } from "@/types/vocabulary";
import { Loader2 } from "lucide-react";
import { TranslationInputCard } from "./_components/TranslationInputCard";
import { TranslationResultCard } from "./_components/TranslationResultCard";

export default function DictionaryPage() {
  // Mode state
  const [isDictionaryMode, setIsDictionaryMode] = useState(true);

  // Dictionary mode state
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelectionUpdate = useRef(false);

  // Translation mode state
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("vi");
  const [isTranslating, setIsTranslating] = useState(false);

  // Debounced suggestion fetching
  useEffect(() => {
    const trimmedTerm = searchTerm.trim();

    // Skip fetching if this update was triggered by a selection
    if (isSelectionUpdate.current) {
      isSelectionUpdate.current = false;
      return;
    }

    // Frontend optimization: Clear suggestions immediately if empty to avoid API call
    if (!trimmedTerm) {
      setSuggestions([]);
      return;
    }

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      setError(null);

      try {
        const words = await dictionaryService.suggestWords(trimmedTerm, 10);
        setSuggestions(words);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Lookup word
  const handleSearch = useCallback(async () => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    // Prevent suggestions from reappearing
    isSelectionUpdate.current = true;

    setIsLoadingWord(true);
    setError(null);
    setSuggestions([]); // Clear suggestions when searching

    try {
      const word = await dictionaryService.lookupWord(trimmedTerm);
      setSelectedWord(word);
    } catch (err: any) {
      console.error("Error looking up word:", err);
      setError(
        err?.message || `Word "${trimmedTerm}" not found. Please try another word.`
      );
      setSelectedWord(null);
    } finally {
      setIsLoadingWord(false);
    }
  }, [searchTerm]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(async (word: Word) => {
    isSelectionUpdate.current = true;
    setSearchTerm(word.word);
    setSuggestions([]);

    // Fetch full word details including images/audio
    setIsLoadingWord(true);
    setError(null);
    try {
      const fullWord = await dictionaryService.lookupWord(word.word);
      setSelectedWord(fullWord);
    } catch (err: any) {
      console.error("Error looking up suggestion:", err);
      // Fallback to suggestion data if lookup fails, but warn user
      setSelectedWord(word);
    } finally {
      setIsLoadingWord(false);
    }
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((isDictionary: boolean) => {
    setIsDictionaryMode(isDictionary);
    // Reset state when switching modes
    if (isDictionary) {
      setSearchTerm("");
      setSuggestions([]);
      setSelectedWord(null);
      setError(null);
    }
  }, []);

  // Handle translation
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const res = await dictionaryService.translatePhrase(inputText, sourceLang, targetLang);
      setTranslationResult(res.translatedText);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(prev => prev === 'en' ? 'vi' : 'en');
    setTargetLang(prev => prev === 'vi' ? 'en' : 'vi');

    // Swap content if there is a result
    if (translationResult) {
      setInputText(translationResult);
      setTranslationResult(inputText);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Mode Toggle */}
      <ModeToggle
        isDictionaryMode={isDictionaryMode}
        onModeChange={handleModeChange}
      />

      {isDictionaryMode ? (
        <>
          {/* Dictionary Mode */}
          <DictionarySearchCard
            query={searchTerm}
            onQueryChange={setSearchTerm}
            onSearch={handleSearch}
          />

          {/* Suggestions */}
          {isLoadingSuggestions && (
            <div className="max-w-4xl mx-auto px-4 mt-4">
              <div className="bg-white rounded-xl border border-neutral-100 p-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="ml-2 text-neutral-600">
                  Đang tải gợi ý...
                </span>
              </div>
            </div>
          )}

          {!isLoadingSuggestions && suggestions.length > 0 && (
            <SuggestionList
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          )}

          {/* Loading Word */}
          {isLoadingWord && (
            <div className="max-w-4xl mx-auto px-4 mt-6">
              <div className="bg-white rounded-xl border border-neutral-100 p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-neutral-600">Đang tìm kiếm từ...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLoadingWord && (
            <div className="max-w-4xl mx-auto px-4 mt-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">❌</div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Word Not Found
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Word Result */}
          {selectedWord && !isLoadingWord && <WordResultCard word={selectedWord} />}

          {/* Empty State */}
          {!searchTerm && !selectedWord && !isLoadingWord && (
            <div className="max-w-4xl mx-auto px-4 mt-12">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Bắt đầu tìm kiếm
                </h3>
                <p className="text-neutral-600">
                  Nhập từ bạn muốn tìm kiếm để tra từ điển
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Translation Mode */}
          <TranslationInputCard
            value={inputText}
            onChange={setInputText}
            onTranslate={handleTranslate}
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSwapLanguages={handleSwapLanguages}
            isLoading={isTranslating}
          />

          <TranslationResultCard
            result={translationResult}
            isLoading={isTranslating}
            targetLang={targetLang}
          />
        </>
      )}
    </div>
  );
}
