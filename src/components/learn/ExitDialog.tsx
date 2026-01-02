"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ExitDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitDialog({ open, onConfirm, onCancel }: ExitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--warning)]/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[var(--warning)]" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">
            Thoát bài học?
          </DialogTitle>
          <DialogDescription className="text-center">
            Tiến trình của bạn sẽ không được lưu. Bạn có chắc muốn thoát?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium border-2 border-[var(--neutral-200)] text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] transition-colors"
          >
            Tiếp tục học
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium bg-[var(--error)] text-white hover:bg-[var(--error)]/90 transition-colors"
          >
            Thoát
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
