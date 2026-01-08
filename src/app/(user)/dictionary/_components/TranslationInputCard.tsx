"use client";

import { ArrowRightLeft, X } from "lucide-react";
import { useRef, useEffect } from "react";

interface TranslationInputCardProps {
    value: string;
    onChange: (value: string) => void;
    onTranslate: () => void;
    sourceLang: string;
    targetLang: string;
    onSwapLanguages: () => void;
    isLoading: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
    en: "Tiếng Anh",
    vi: "Tiếng Việt",
};

export function TranslationInputCard({
    value,
    onChange,
    onTranslate,
    sourceLang,
    targetLang,
    onSwapLanguages,
    isLoading,
}: TranslationInputCardProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onTranslate();
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                {/* Header with Language Swap */}
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-primary w-24 text-center">
                            {LANGUAGE_NAMES[sourceLang] || sourceLang}
                        </span>
                        <button
                            onClick={onSwapLanguages}
                            className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                            title="Swap languages"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-primary w-24 text-center">
                            {LANGUAGE_NAMES[targetLang] || targetLang}
                        </span>
                    </div>
                </div>

                {/* Input Area */}
                <div className="relative p-4">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập văn bản cần dịch..."
                        className="w-full min-h-[120px] resize-none outline-none text-lg text-neutral-800 placeholder:text-neutral-400 bg-transparent"
                        disabled={isLoading}
                    />

                    {value && (
                        <button
                            onClick={() => onChange("")}
                            className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={onTranslate}
                            disabled={!value.trim() || isLoading}
                            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? "Đang dịch..." : "Dịch"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
