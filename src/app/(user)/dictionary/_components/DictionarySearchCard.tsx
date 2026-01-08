"use client";

import { Search } from "lucide-react";

interface DictionarySearchCardProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: () => void;
}

export function DictionarySearchCard({
    query,
    onQueryChange,
    onSearch,
}: DictionarySearchCardProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pt-6">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Nhập từ cần tìm kiếm..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg transition-shadow"
                    />
                </div>
            </form>
        </div>
    );
}
