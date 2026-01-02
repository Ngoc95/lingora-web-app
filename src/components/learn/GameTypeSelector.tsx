"use client";

import { cn } from "@/lib/utils";
import { GameType, GAME_TYPE_LABELS } from "@/types/vocabulary";
import { Check, Volume2, MessageSquare, CheckCircle, BookOpen, Mic } from "lucide-react";

interface GameTypeSelectorProps {
  selectedTypes: Set<GameType>;
  onChange: (types: Set<GameType>) => void;
}

const GAME_TYPE_ICONS: Record<GameType, React.ComponentType<{ className?: string }>> = {
  [GameType.LISTEN_FILL]: Volume2,
  [GameType.LISTEN_CHOOSE]: Volume2,
  [GameType.TRUE_FALSE]: CheckCircle,
  [GameType.SEE_WORD_CHOOSE_MEANING]: BookOpen,
  [GameType.SEE_MEANING_CHOOSE_WORD]: MessageSquare,
  [GameType.PRONUNCIATION]: Mic,
};

export function GameTypeSelector({ selectedTypes, onChange }: GameTypeSelectorProps) {
  const toggleType = (type: GameType) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    onChange(newTypes);
  };

  const isValid = selectedTypes.size >= 2;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--neutral-900)] uppercase tracking-wide">
          Loại câu hỏi
        </label>
        <span
          className={cn(
            "text-xs font-medium",
            isValid ? "text-[var(--success)]" : "text-[var(--error)]"
          )}
        >
          {selectedTypes.size}/6 (tối thiểu 2)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.values(GameType).map((type) => {
          const isSelected = selectedTypes.has(type);
          const Icon = GAME_TYPE_ICONS[type];

          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                "border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2",
                isSelected
                  ? "border-[var(--primary-500)] bg-[var(--primary-500)]/10"
                  : "border-[var(--neutral-200)] bg-white hover:border-[var(--neutral-400)]"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded border-2 transition-colors",
                  isSelected
                    ? "border-[var(--primary-500)] bg-[var(--primary-500)] text-white"
                    : "border-[var(--neutral-400)]"
                )}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isSelected ? "text-[var(--primary-500)]" : "text-[var(--neutral-600)]"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium truncate",
                  isSelected ? "text-[var(--primary-500)]" : "text-[var(--neutral-900)]"
                )}
              >
                {GAME_TYPE_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>

      {!isValid && (
        <p className="text-xs text-[var(--error)]">
          Vui lòng chọn ít nhất 2 loại câu hỏi để bắt đầu
        </p>
      )}
    </div>
  );
}
