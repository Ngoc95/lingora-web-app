"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/components/learn/Flashcard";
import { QuizQuestionComponent } from "@/components/learn/QuizQuestion";
import { PronunciationQuiz } from "@/components/learn/PronunciationQuiz";
import { FeedbackCard } from "@/components/learn/FeedbackCard";
import { CompletionDialog } from "@/components/learn/CompletionDialog";
import { ExitDialog } from "@/components/learn/ExitDialog";
import { vocabularyService } from "@/services/vocabulary.service";
import { GameType } from "@/types/vocabulary";
import type { Word, QuizQuestion, LearningPhase } from "@/types/vocabulary";

// Mock data removed

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestions(words: Word[], gameTypes: Set<GameType>): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const typesArray = Array.from(gameTypes);

  words.forEach((word) => {
    // Generate 2 questions per word
    for (let i = 0; i < 2; i++) {
      const type = typesArray[Math.floor(Math.random() * typesArray.length)];
      const otherWords = words.filter((w) => w.id !== word.id);
      
      let question: QuizQuestion;

      switch (type) {
        case GameType.LISTEN_FILL:
          question = {
            type,
            question: `Nghe và điền từ tiếng Anh của "${word.vnMeaning || word.meaning}":`,
            correctAnswer: word.word,
            options: [],
            word,
            attemptCount: 0,
          };
          break;

        case GameType.LISTEN_CHOOSE:
          question = {
            type,
            question: "Nghe và chọn từ đúng",
            correctAnswer: word.word,
            options: shuffle([word.word, ...shuffle(otherWords).slice(0, 3).map((w) => w.word)]),
            word,
            attemptCount: 0,
          };
          break;

        case GameType.TRUE_FALSE: {
          const isTrue = Math.random() > 0.5;
          const displayMeaning = isTrue
            ? word.vnMeaning || word.meaning
            : shuffle(otherWords)[0]?.vnMeaning || shuffle(otherWords)[0]?.meaning || word.vnMeaning;
          question = {
            type,
            question: `"${word.word}" có nghĩa là "${displayMeaning}"`,
            correctAnswer: isTrue ? "Đúng" : "Sai",
            options: ["Đúng", "Sai"],
            word,
            attemptCount: 0,
          };
          break;
        }

        case GameType.SEE_WORD_CHOOSE_MEANING:
          question = {
            type,
            question: `Nghĩa của từ "${word.word}" là gì?`,
            correctAnswer: word.vnMeaning || word.meaning || "",
            options: shuffle([
              word.vnMeaning || word.meaning || "",
              ...shuffle(otherWords).slice(0, 3).map((w) => w.vnMeaning || w.meaning || ""),
            ]),
            word,
            attemptCount: 0,
          };
          break;

        case GameType.SEE_MEANING_CHOOSE_WORD:
          question = {
            type,
            question: `Từ tiếng Anh của "${word.vnMeaning || word.meaning}" là gì?`,
            correctAnswer: word.word,
            options: shuffle([word.word, ...shuffle(otherWords).slice(0, 3).map((w) => w.word)]),
            word,
            attemptCount: 0,
          };
          break;

        case GameType.PRONUNCIATION:
        default:
          question = {
            type: GameType.PRONUNCIATION,
            question: `Phát âm từ "${word.word}"`,
            correctAnswer: word.word,
            options: [],
            word,
            attemptCount: 0,
          };
          break;
      }

      questions.push(question);
    }
  });

  return shuffle(questions);
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = Number(params.topicId);

  const wordCount = Number(searchParams.get("wordCount")) || 10;
  const gameTypesStr = searchParams.get("gameTypes") || "SEE_WORD_CHOOSE_MEANING,SEE_MEANING_CHOOSE_WORD";
  const gameTypes = new Set(
    gameTypesStr.split(",").filter((t) => Object.values(GameType).includes(t as GameType)) as GameType[]
  );

  // State
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<LearningPhase>("LEARN");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlashcardRevealed, setIsFlashcardRevealed] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const wordCount = Number(searchParams.get("wordCount")) || 10;
        const res = await vocabularyService.getStudyWords(Number(topicId), wordCount);
        const fetchedWords = res.metaData.words;
        
        if (fetchedWords.length === 0) {
           console.warn("No words found for this topic");
        }

        setWords(fetchedWords);

        // Generate questions
        const gameTypesStr = searchParams.get("gameTypes");
        let gameTypes = new Set<GameType>();
        if (gameTypesStr) {
          gameTypesStr.split(",").forEach(t => {
            if (Object.values(GameType).includes(t as GameType)) {
              gameTypes.add(t as GameType);
            }
          });
        }
        
        if (gameTypes.size === 0) {
             gameTypes.add(GameType.SEE_WORD_CHOOSE_MEANING);
             gameTypes.add(GameType.SEE_MEANING_CHOOSE_WORD);
        }

        const generatedQuestions = generateQuestions(fetchedWords, gameTypes);
        setQuestions(generatedQuestions);
        setTotalQuestions(generatedQuestions.length);

      } catch (error) {
        console.error("Failed to fetch study words", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [topicId, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate progress
  const flashcardProgress = phase === "LEARN" ? currentWordIndex + 1 : words.length;
  // Previously quizProgress logic was: const quizProgress = phase === "QUIZ" ? totalQuestions - questions.length : 0; 
  // But questions is the array of REMAINING questions usually? Or full array?
  // Use currentQuestionIndex for progress if questions array is constant.
  // Assuming questions array is NOT mutated (popped), but currentQuestionIndex is incremented.
  const quizProgress = currentQuestionIndex;
  const totalSteps = words.length + totalQuestions;
  const currentProgress = ((phase === "LEARN" ? flashcardProgress : words.length + quizProgress) / totalSteps) * 100;

  const currentStep = flashcardProgress + quizProgress;
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const currentWord = words[currentWordIndex];
  const currentQuestion = questions[currentQuestionIndex];

  // Handlers
  const handleFlashcardReveal = () => {
    setIsFlashcardRevealed((prev) => !prev);
  };

  const handleNextFlashcard = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setIsFlashcardRevealed(false);
    } else {
      // Move to quiz phase
      setPhase("QUIZ");
    }
  };

  const handlePrevFlashcard = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
      setIsFlashcardRevealed(false);
    }
  };

  const handleCheckAnswer = useCallback(() => {
    if (!currentQuestion) return;
    
    const answer = currentQuestion.type === GameType.LISTEN_FILL ? typedAnswer : selectedAnswer;
    const isCorrect = answer?.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    
    setIsAnswerChecked(true);
  }, [currentQuestion, selectedAnswer, typedAnswer]);

  const handleContinue = useCallback(() => {
    if (!currentQuestion) return;

    const answer = currentQuestion.type === GameType.LISTEN_FILL ? typedAnswer : selectedAnswer;
    const isCorrect = answer?.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      // Remove question
      setQuestions((prev) => prev.filter((_, i) => i !== currentQuestionIndex));
    } else {
      // Move to end
      setQuestions((prev) => {
        const newQuestions = [...prev];
        const [removed] = newQuestions.splice(currentQuestionIndex, 1);
        removed.attemptCount += 1;
        
        // For pronunciation, skip after 2 attempts
        if (removed.type === GameType.PRONUNCIATION && removed.attemptCount >= 2) {
          return newQuestions;
        }
        
        newQuestions.push(removed);
        return newQuestions;
      });
    }

    // Reset state
    setSelectedAnswer(null);
    setTypedAnswer("");
    setIsAnswerChecked(false);

    // Check completion
    if (questions.length <= 1 && isCorrect) {
      setShowCompletionDialog(true);
    }
  }, [currentQuestion, selectedAnswer, typedAnswer, currentQuestionIndex, questions.length]);

  const handlePronunciationResult = useCallback((isCorrect: boolean) => {
    if (!currentQuestion) return;

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setQuestions((prev) => prev.filter((_, i) => i !== currentQuestionIndex));
    } else {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        const [removed] = newQuestions.splice(currentQuestionIndex, 1);
        removed.attemptCount += 1;
        
        if (removed.attemptCount >= 2) {
          return newQuestions;
        }
        
        newQuestions.push(removed);
        return newQuestions;
      });
    }

    // Check completion
    setTimeout(() => {
      if (questions.length <= 1) {
        setShowCompletionDialog(true);
      }
    }, 1500);
  }, [currentQuestion, currentQuestionIndex, questions.length]);

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await vocabularyService.createWordProgress({
        wordIds: words.map((w) => w.id),
      });
    } catch (error) {
      console.error("Failed to save progress", error);
    } finally {
      setIsSaving(false);
      router.back();
    }
  };

  const handleExit = () => {
    setShowExitDialog(false);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--neutral-600)]">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--primary-600)]/5 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[var(--neutral-200)] p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowExitDialog(true)}
              className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-[var(--neutral-600)]">
              {currentStep}/{totalSteps}
            </span>
            <div className="w-9" /> {/* Spacer */}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 flex items-center justify-center p-4 transition-all duration-300",
        isAnswerChecked && "pb-64" // Add extra padding when feedback card is visible
      )}>
        {phase === "LEARN" && currentWord && (
          <div className="w-full max-w-md">
            <Flashcard
              word={currentWord}
              isRevealed={isFlashcardRevealed}
              onReveal={handleFlashcardReveal}
            />
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevFlashcard}
                disabled={currentWordIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--neutral-600)] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Thẻ trước
              </button>
              <button
                onClick={handleNextFlashcard}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-[var(--primary-500)] text-white hover:bg-[var(--primary-500)]/90 transition-colors"
              >
                {currentWordIndex === words.length - 1 ? "Làm Quiz" : "Thẻ tiếp"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {phase === "QUIZ" && currentQuestion && (
          currentQuestion.type === GameType.PRONUNCIATION ? (
            <PronunciationQuiz
              question={currentQuestion}
              onResult={handlePronunciationResult}
            />
          ) : (
            <QuizQuestionComponent
              question={currentQuestion}
              questionNumber={totalQuestions - questions.length + 1}
              totalQuestions={totalQuestions}
              selectedAnswer={selectedAnswer}
              typedAnswer={typedAnswer}
              isAnswerChecked={isAnswerChecked}
              onSelectAnswer={setSelectedAnswer}
              onTypeAnswer={setTypedAnswer}
              onCheckAnswer={handleCheckAnswer}
            />
          )
        )}
      </div>

      {/* Feedback Card */}
      {phase === "QUIZ" && isAnswerChecked && currentQuestion && currentQuestion.type !== GameType.PRONUNCIATION && (
        <FeedbackCard
          isCorrect={
            (currentQuestion.type === GameType.LISTEN_FILL ? typedAnswer : selectedAnswer)
              ?.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
          }
          word={currentQuestion.word}
          onContinue={handleContinue}
        />
      )}

      {/* Dialogs */}
      <CompletionDialog
        open={showCompletionDialog}
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
        onClose={handleComplete}
        isLoading={isSaving}
      />

      <ExitDialog
        open={showExitDialog}
        onConfirm={handleExit}
        onCancel={() => setShowExitDialog(false)}
      />
    </div>
  );
}
