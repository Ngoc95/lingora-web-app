"use client";

interface ModeToggleProps {
    isDictionaryMode: boolean;
    onModeChange: (isDictionary: boolean) => void;
}

export function ModeToggle({ isDictionaryMode, onModeChange }: ModeToggleProps) {
    return (
        <div className="bg-white border-b border-neutral-100">
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
                    <button
                        onClick={() => onModeChange(true)}
                        className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${isDictionaryMode
                                ? "bg-white text-primary shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                    >
                        📖 Từ điển
                    </button>
                    <button
                        onClick={() => onModeChange(false)}
                        className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${!isDictionaryMode
                                ? "bg-white text-primary shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                    >
                        🌐 Phiên dịch
                    </button>
                </div>
            </div>
        </div>
    );
}
