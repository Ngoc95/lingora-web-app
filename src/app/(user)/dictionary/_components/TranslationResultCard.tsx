"use client";

import { Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface TranslationResultCardProps {
    result: string;
    isLoading: boolean;
    targetLang: string;
}

export function TranslationResultCard({
    result,
    isLoading,
}: TranslationResultCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 mt-4">
                <div className="bg-white rounded-xl border border-neutral-100 p-8 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 mt-4">
            <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 relative group">
                <p className="text-lg text-neutral-900 leading-relaxed whitespace-pre-wrap">
                    {result}
                </p>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-primary/10">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                        title="Copy translation"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
