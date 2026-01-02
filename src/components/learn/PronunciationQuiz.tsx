"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/vocabulary";

// Web Speech API types
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface PronunciationQuizProps {
  question: QuizQuestion;
  onResult: (isCorrect: boolean, recognizedText: string) => void;
}

export function PronunciationQuiz({ question, onResult }: PronunciationQuizProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const handlePlayAudio = () => {
    if (question.word.audioUrl) {
      const audio = new Audio(question.word.audioUrl);
      audio.play().catch(console.error);
    }
  };

  const startListening = useCallback(() => {
    setError(null);
    setRecognizedText(null);
    setHasResult(false);

    // Check browser support
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError("Trình duyệt không hỗ trợ nhận dạng giọng nói");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const resultsArray: string[] = [];
      const firstResult = event.results[0];
      for (let i = 0; i < Math.min(3, firstResult.length); i++) {
        resultsArray.push(firstResult[i].transcript.trim());
      }

      const expectedWord = question.word.word.trim().toLowerCase();
      const correct = resultsArray.some(
        (r) => r.toLowerCase() === expectedWord
      );

      setRecognizedText(resultsArray[0] || "");
      setIsCorrect(correct);
      setHasResult(true);
      setIsListening(false);

      // Delay before reporting result
      setTimeout(() => {
        onResult(correct, resultsArray[0] || "");
      }, 1500);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      switch (event.error) {
        case "no-speech":
          setError("Không nghe thấy gì. Hãy nhấn mic và nói ngay!");
          break;
        case "audio-capture":
          setError("Lỗi microphone. Kiểm tra quyền truy cập.");
          break;
        case "not-allowed":
          setError("Chưa cấp quyền microphone. Vui lòng cho phép trong cài đặt trình duyệt.");
          break;
        case "network":
          setError("Lỗi mạng. Cần kết nối internet ổn định.");
          break;
        default:
          setError(`Lỗi: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [question.word.word, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-[var(--neutral-200)] p-6 text-center">
        {/* Header */}
        <div className="mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
            Luyện phát âm
          </span>
        </div>

        {/* Word Display */}
        <h2 className="text-4xl font-bold text-[var(--neutral-900)] mb-2">
          {question.word.word}
        </h2>

        {question.word.phonetic && (
          <p className="text-lg text-[var(--neutral-600)] mb-2">
            {question.word.phonetic}
          </p>
        )}

        <p className="text-base text-[var(--neutral-600)] mb-6">
          {question.word.vnMeaning || question.word.meaning}
        </p>

        {/* Play Audio Button */}
        <button
          type="button"
          onClick={handlePlayAudio}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] transition-colors mb-8"
          disabled={!question.word.audioUrl}
        >
          <Volume2 className="w-5 h-5 text-[var(--primary-500)]" />
          <span className="text-sm font-medium text-[var(--neutral-900)]">
            Nghe mẫu
          </span>
        </button>

        {/* Microphone Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={hasResult}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200",
              isListening
                ? "bg-[var(--error)] text-white animate-pulse"
                : hasResult
                ? "bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed"
                : "bg-[var(--primary-500)] text-white hover:bg-[var(--primary-500)]/90"
            )}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          <p className="mt-3 text-sm text-[var(--neutral-600)]">
            {isListening ? "Đang nghe..." : hasResult ? "" : "Nhấn để đọc"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm mb-4">
            {error}
          </div>
        )}

        {/* Result */}
        {hasResult && recognizedText !== null && (
          <div
            className={cn(
              "p-4 rounded-xl",
              isCorrect ? "bg-[var(--success)]/10" : "bg-[var(--error)]/10"
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span
                className={cn(
                  "text-lg font-semibold",
                  isCorrect ? "text-[var(--success)]" : "text-[var(--error)]"
                )}
              >
                {isCorrect ? "✓ Chính xác!" : "✗ Chưa đúng"}
              </span>
            </div>
            <p className="text-sm text-[var(--neutral-600)]">
              Bạn nói: &quot;{recognizedText}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
