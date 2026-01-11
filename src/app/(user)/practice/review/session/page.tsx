"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Volume2,
  Check,
  X,
  Loader2,
  RotateCcw,
  Mic,
} from "lucide-react";
import { vocabularyService } from "@/services/vocabulary.service";
import {
  GameType,
  Word,
  QuizQuestion,
} from "@/types/vocabulary";

function ReviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = Number(searchParams.get("count")) || 10;
  const typesParam = searchParams.get("types") || "";
  const selectedTypes = useMemo(
    () => new Set(typesParam.split(",").filter(Boolean) as GameType[]),
    [typesParam]
  );

  const [words, setWords] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<
    { wordId: number; correct: boolean; wrongCount: number }[]
  >([]);

  // Dialogs
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadWords();
  }, [count]);

  const loadWords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.getReviewWords({ limit: count });
      const wordsData = response.metaData.words || [];
      setWords(wordsData);

      // Generate questions
      const generatedQuestions = generateQuestions(wordsData, selectedTypes);
      setQuestions(generatedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = (
    words: Word[],
    types: Set<GameType>
  ): QuizQuestion[] => {
    const allQuestions: QuizQuestion[] = [];
    const typeArray = Array.from(types);

    words.forEach((word) => {
      // Pick a random game type for this word
      const type = typeArray[Math.floor(Math.random() * typeArray.length)];
      const question = createQuestion(word, type, words);
      if (question) {
        allQuestions.push(question);
      }
    });

    // Shuffle questions
    return allQuestions.sort(() => Math.random() - 0.5);
  };

  const createQuestion = (
    word: Word,
    type: GameType,
    allWords: Word[]
  ): QuizQuestion | null => {
    const otherWords = allWords.filter((w) => w.id !== word.id);
    const wrongOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    switch (type) {
      case GameType.SEE_WORD_CHOOSE_MEANING: {
        const options = [
          word.vnMeaning || word.meaning || "",
          ...wrongOptions.map((w) => w.vnMeaning || w.meaning || ""),
        ].sort(() => Math.random() - 0.5);
        return {
          type,
          question: word.word,
          correctAnswer: word.vnMeaning || word.meaning || "",
          options,
          word,
          attemptCount: 0,
        };
      }
      case GameType.SEE_MEANING_CHOOSE_WORD: {
        const options = [
          word.word,
          ...wrongOptions.map((w) => w.word),
        ].sort(() => Math.random() - 0.5);
        return {
          type,
          question: word.vnMeaning || word.meaning || "",
          correctAnswer: word.word,
          options,
          word,
          attemptCount: 0,
        };
      }
      case GameType.TRUE_FALSE: {
        const isTrue = Math.random() > 0.5;
        const displayMeaning = isTrue
          ? word.vnMeaning || word.meaning
          : wrongOptions[0]?.vnMeaning || wrongOptions[0]?.meaning;
        return {
          type,
          question: `${word.word} = ${displayMeaning}`,
          correctAnswer: isTrue ? "Đúng" : "Sai",
          options: ["Đúng", "Sai"],
          word,
          attemptCount: 0,
        };
      }
      case GameType.LISTEN_CHOOSE: {
        const options = [
          word.word,
          ...wrongOptions.map((w) => w.word),
        ].sort(() => Math.random() - 0.5);
        return {
          type,
          question: "Nghe và chọn từ đúng",
          correctAnswer: word.word,
          options,
          word,
          attemptCount: 0,
        };
      }
      case GameType.LISTEN_FILL:
        return {
          type,
          question: "Nghe và điền từ",
          correctAnswer: word.word.toLowerCase(),
          options: [],
          word,
          attemptCount: 0,
        };
      case GameType.PRONUNCIATION:
        return {
          type,
          question: `Phát âm từ: ${word.word}`,
          correctAnswer: word.word,
          options: [],
          word,
          attemptCount: 0,
        };
      default:
        return null;
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  const playAudio = useCallback(() => {
    if (currentQuestion?.word.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(currentQuestion.word.audioUrl);
      audioRef.current.play().catch(console.error);
    }
  }, [currentQuestion]);

  // Auto-play audio for listening questions
  useEffect(() => {
    if (
      currentQuestion?.type === GameType.LISTEN_CHOOSE ||
      currentQuestion?.type === GameType.LISTEN_FILL
    ) {
      playAudio();
    }
  }, [currentQuestion, playAudio]);

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let answer: string;
    if (
      currentQuestion.type === GameType.LISTEN_FILL ||
      currentQuestion.type === GameType.PRONUNCIATION
    ) {
      answer = typedAnswer.trim().toLowerCase();
    } else {
      answer = selectedAnswer || "";
    }

    const correct =
      answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    // Track result
    setResults((prev) => {
      const existing = prev.find((r) => r.wordId === currentQuestion.word.id);
      if (existing) {
        return prev.map((r) =>
          r.wordId === currentQuestion.word.id
            ? { ...r, correct, wrongCount: correct ? r.wrongCount : r.wrongCount + 1 }
            : r
        );
      }
      return [...prev, { wordId: currentQuestion.word.id, correct, wrongCount: correct ? 0 : 1 }];
    });
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setTypedAnswer("");
    setIsAnswerChecked(false);
    setIsCorrect(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompletionDialog(true);
    }
  };

  const handleComplete = async (saveResults: boolean) => {
    if (saveResults && results.length > 0) {
      setSubmitting(true);
      try {
        const now = new Date().toISOString();
        await vocabularyService.updateWordProgress({
          wordProgress: results.map((r) => ({
            wordId: r.wordId,
            wrongCount: r.wrongCount,
            reviewedDate: now,
          })),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      } finally {
        setSubmitting(false);
      }
    }
    router.push("/practice/review");
  };

  const correctCount = results.filter((r) => r.correct).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">
          {error || "Không có từ để ôn tập"}
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowExitDialog(true)}
            className="p-2 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-neutral-900">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-10" />
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-neutral-200">
          <div
            className="h-full bg-gradient-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Game Type Label */}
          <p className="text-sm text-neutral-500 text-center mb-2">
            {currentQuestion.type === GameType.SEE_WORD_CHOOSE_MEANING &&
              "Chọn nghĩa đúng"}
            {currentQuestion.type === GameType.SEE_MEANING_CHOOSE_WORD &&
              "Chọn từ đúng"}
            {currentQuestion.type === GameType.TRUE_FALSE &&
              "Đúng hay Sai?"}
            {currentQuestion.type === GameType.LISTEN_CHOOSE &&
              "Nghe và chọn từ"}
            {currentQuestion.type === GameType.LISTEN_FILL &&
              "Nghe và điền từ"}
            {currentQuestion.type === GameType.PRONUNCIATION &&
              "Phát âm từ"}
          </p>

          {/* Question */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 mb-6">
            {/* Audio button for listening */}
            {(currentQuestion.type === GameType.LISTEN_CHOOSE ||
              currentQuestion.type === GameType.LISTEN_FILL) && (
              <button
                onClick={playAudio}
                className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-8 h-8 text-primary" />
              </button>
            )}

            <h2 className="text-2xl font-bold text-neutral-900 text-center">
              {currentQuestion.question}
            </h2>

            {currentQuestion.word.phonetic && (
              <p className="text-neutral-500 text-center mt-2">
                {currentQuestion.word.phonetic}
              </p>
            )}
          </div>

          {/* Answer Options */}
          {currentQuestion.options.length > 0 ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption =
                  option === currentQuestion.correctAnswer;

                let optionClass =
                  "border-neutral-200 hover:border-primary/50";
                if (isAnswerChecked) {
                  if (isCorrectOption) {
                    optionClass = "border-green-500 bg-green-50";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = "border-red-500 bg-red-50";
                  }
                } else if (isSelected) {
                  optionClass = "border-primary bg-primary/5";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isAnswerChecked && setSelectedAnswer(option)}
                    disabled={isAnswerChecked}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${optionClass}`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            // Text input for fill-in or pronunciation
            <div className="relative">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isAnswerChecked && checkAnswer()
                }
                disabled={isAnswerChecked}
                placeholder="Nhập câu trả lời..."
                className={`w-full p-4 rounded-xl border text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  isAnswerChecked
                    ? isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-neutral-200"
                }`}
              />
              {currentQuestion.type === GameType.PRONUNCIATION && (
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary/10 rounded-full">
                  <Mic className="w-5 h-5 text-primary" />
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          {isAnswerChecked && (
            <div
              className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                isCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isCorrect ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <X className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "Chính xác!" : "Sai rồi!"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-neutral-700">
                    Đáp án đúng: {currentQuestion.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-white border-t border-neutral-100 p-4">
        <div className="max-w-lg mx-auto">
          {!isAnswerChecked ? (
            <button
              onClick={checkAnswer}
              disabled={
                currentQuestion.options.length > 0
                  ? !selectedAnswer
                  : !typedAnswer.trim()
              }
              className="w-full py-4 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
            >
              Kiểm tra
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="w-full py-4 text-white rounded-xl font-semibold"
              style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
            >
              {currentIndex < questions.length - 1
                ? "Câu tiếp theo"
                : "Hoàn thành"}
            </button>
          )}
        </div>
      </div>

      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              Thoát ôn tập?
            </h2>
            <p className="text-neutral-600 mb-6">
              Tiến trình hiện tại sẽ không được lưu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium"
              >
                Tiếp tục
              </button>
              <button
                onClick={() => router.push("/practice/review")}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Dialog */}
      {showCompletionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Hoàn thành!
            </h2>
            <p className="text-neutral-600 mb-2">
              Bạn đã trả lời đúng {correctCount} / {questions.length} câu
            </p>
            <p className="text-3xl font-bold text-primary mb-6">
              {Math.round((correctCount / questions.length) * 100)}%
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium"
              >
                Không lưu
              </button>
              <button
                onClick={() => handleComplete(true)}
                disabled={submitting}
                className="flex-1 py-3 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Lưu kết quả"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ReviewSessionContent />
    </Suspense>
  );
}
