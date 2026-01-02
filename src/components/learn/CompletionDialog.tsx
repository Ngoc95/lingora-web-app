"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface CompletionDialogProps {
  open: boolean;
  correctAnswers: number;
  totalQuestions: number;
  onClose: () => void;
  isLoading?: boolean;
}

export function CompletionDialog({
  open,
  correctAnswers,
  totalQuestions,
  onClose,
  isLoading,
}: CompletionDialogProps) {
  const accuracy = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const getMessage = () => {
    if (accuracy >= 90) return "Xuất sắc! 🎉";
    if (accuracy >= 70) return "Tốt lắm! 👏";
    if (accuracy >= 50) return "Khá tốt! 💪";
    return "Cố gắng thêm! 📚";
  };

  return (
    <Dialog open={open} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl text-center">
            {getMessage()}
          </DialogTitle>
          <DialogDescription className="text-center">
            Bạn đã hoàn thành bài học!
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Accuracy Circle */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--neutral-200)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--primary-500)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 352} 352`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--primary-500)]">
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-[var(--neutral-900)]">
              {correctAnswers}/{totalQuestions} câu đúng
            </p>
            <Progress value={accuracy} className="h-2" />
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-medium bg-[var(--primary-500)] text-white hover:bg-[var(--primary-500)]/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Đang lưu..." : "Hoàn thành"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
