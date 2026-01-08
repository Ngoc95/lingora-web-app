"use client";

import { Volume2 } from "lucide-react";
import type { Word } from "@/types/vocabulary";
import { useState, useRef } from "react";

interface WordResultCardProps {
    word: Word;
}

export function WordResultCard({ word }: WordResultCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayAudio = () => {
        if (!word.audioUrl) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }

        const audio = new Audio(word.audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
            setIsPlaying(false);
            audioRef.current = null;
        };
        audio.onerror = () => {
            setIsPlaying(false);
            audioRef.current = null;
        };

        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            audioRef.current = null;
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
                {/* Word Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-neutral-900">
                                {word.word}
                            </h2>
                            {word.audioUrl && (
                                <button
                                    onClick={handlePlayAudio}
                                    className={`p-2 rounded-lg transition-all ${isPlaying
                                        ? "bg-primary text-white"
                                        : "bg-primary/10 text-primary hover:bg-primary/20"
                                        }`}
                                    aria-label="Play pronunciation"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {word.phonetic && (
                                <span className="text-lg text-primary font-medium">
                                    {word.phonetic}
                                </span>
                            )}
                            {word.type && (
                                <span className="text-sm text-neutral-600">• {word.type}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* CEFR Level Badge */}
                {word.cefrLevel && (
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
                            {word.cefrLevel}
                        </span>
                    </div>
                )}

                {/* Word Image */}
                {word.imageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden bg-neutral-50 flex justify-center">
                        <img
                            src={word.imageUrl}
                            alt={word.word}
                            className="w-full h-48 object-contain"
                        />
                    </div>
                )}

                {/* Meanings */}
                <div className="space-y-4">
                    {word.meaning && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 mb-1">
                                English:
                            </p>
                            <p className="text-neutral-700 leading-relaxed">{word.meaning}</p>
                        </div>
                    )}

                    {word.vnMeaning && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 mb-1">
                                Vietnamese:
                            </p>
                            <p className="text-neutral-700 leading-relaxed">
                                {word.vnMeaning}
                            </p>
                        </div>
                    )}

                    {/* Example Section */}
                    {word.example && (
                        <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
                            <p className="text-sm font-semibold text-primary mb-2">
                                Example:
                            </p>
                            <p className="text-neutral-700 italic mb-2">"{word.example}"</p>
                            {word.exampleTranslation && (
                                <p className="text-sm text-neutral-600">
                                    {word.exampleTranslation}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
