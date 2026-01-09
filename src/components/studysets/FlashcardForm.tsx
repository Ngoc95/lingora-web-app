"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlashcardFormData } from "@/types/studySet";

interface FlashcardFormProps {
  index: number;
  flashcard: FlashcardFormData;
  onUpdate: (updated: FlashcardFormData) => void;
  onRemove: () => void;
}

export function FlashcardForm({
  index,
  flashcard,
  onUpdate,
  onRemove,
}: FlashcardFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      onUpdate({
        ...flashcard,
        pendingImage: file,
        previewUrl,
      });
    },
    [flashcard, onUpdate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    if (flashcard.previewUrl) {
      URL.revokeObjectURL(flashcard.previewUrl);
    }
    onUpdate({
      ...flashcard,
      pendingImage: undefined,
      previewUrl: undefined,
      imageUrl: undefined,
    });
  };

  const imagePreview = flashcard.previewUrl || flashcard.imageUrl;

  return (
    <div className="bg-white rounded-xl border border-[var(--neutral-200)] p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[var(--neutral-900)]">
          Thẻ #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-[var(--neutral-100)] text-[var(--neutral-400)] hover:text-[var(--error)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
        {/* Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden",
            isDragging
              ? "border-[var(--primary-500)] bg-[var(--primary-500)]/5"
              : "border-[var(--neutral-200)] hover:border-[var(--primary-500)]/50 bg-[var(--neutral-50)]"
          )}
        >
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--neutral-400)] p-2">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs text-center">Thêm ảnh</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Text Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
              Mặt trước <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={flashcard.frontText}
              onChange={(e) =>
                onUpdate({ ...flashcard, frontText: e.target.value })
              }
              placeholder="Từ vựng, câu hỏi..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
              Mặt sau <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={flashcard.backText}
              onChange={(e) =>
                onUpdate({ ...flashcard, backText: e.target.value })
              }
              placeholder="Nghĩa, đáp án..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
              Ví dụ <span className="text-[var(--neutral-400)]">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={flashcard.example || ""}
              onChange={(e) =>
                onUpdate({ ...flashcard, example: e.target.value })
              }
              placeholder="Câu ví dụ minh họa..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
