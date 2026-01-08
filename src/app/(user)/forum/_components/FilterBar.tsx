"use client";

import { Search, X } from "lucide-react";
import { PostTopic, PostStatus } from "@/types/forum";
import { useState } from "react";

interface FilterBarProps {
    searchInput: string;
    searchTags: string[];
    selectedTopic: PostTopic | null;
    showMyPosts: boolean;
    myPostsStatus: PostStatus;
    onSearchInputChange: (value: string) => void;
    onRemoveTag: (tag: string) => void;
    onAddTag: (tag: string) => void;
    onTopicSelect: (topic: PostTopic | null) => void;
    onShowMyPostsChange: (show: boolean) => void;
    onMyPostsStatusChange: (status: PostStatus) => void;
}

const TOPIC_LABELS: Record<PostTopic, string> = {
    [PostTopic.GENERAL]: "Tổng hợp",
    [PostTopic.VOCABULARY]: "Từ vựng",
    [PostTopic.GRAMMAR]: "Ngữ pháp",
    [PostTopic.LISTENING]: "Listening",
    [PostTopic.SPEAKING]: "Speaking",
    [PostTopic.READING]: "Reading",
    [PostTopic.WRITING]: "Writing",
};

export function FilterBar({
    searchInput,
    searchTags,
    selectedTopic,
    showMyPosts,
    myPostsStatus,
    onSearchInputChange,
    onRemoveTag,
    onAddTag,
    onTopicSelect,
    onShowMyPostsChange,
    onMyPostsStatusChange,
}: FilterBarProps) {
    const [localInput, setLocalInput] = useState(searchInput);

    const handleInputChange = (value: string) => {
        setLocalInput(value);
        onSearchInputChange(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " || e.key === "Spacebar") {
            const trimmed = localInput.trim();

            // Check if it's a tag
            if (trimmed.startsWith("#") && trimmed.length > 1) {
                e.preventDefault();
                const tag = trimmed.substring(1);
                onAddTag(tag);
                setLocalInput("");
                // Also clear the parent's searchInput
                onSearchInputChange("");
            }
        }
    };

    return (
        <div className="bg-white border-b border-neutral-100">
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
                {/* Search Bar with Tags */}
                <div className="relative">
                    <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50">
                        <Search className="w-5 h-5 text-neutral-400 shrink-0" />

                        {/* Tags Display */}
                        {searchTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {searchTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded-md"
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => onRemoveTag(tag)}
                                            className="hover:bg-blue-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder={searchTags.length > 0 ? "" : "Tìm kiếm bài viết... (gõ #tag và Space)"}
                            value={localInput}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Owner Filter */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onShowMyPostsChange(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showMyPosts
                            ? "bg-primary text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                    >
                        Khám phá
                    </button>
                    <button
                        onClick={() => onShowMyPostsChange(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showMyPosts
                            ? "bg-primary text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                    >
                        Của tôi
                    </button>

                    {/* Status Filter (only when viewing my posts) */}
                    {showMyPosts && (
                        <>
                            <div className="w-px h-6 bg-neutral-200 mx-2" />
                            <button
                                onClick={() => onMyPostsStatusChange(PostStatus.PUBLISHED)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${myPostsStatus === PostStatus.PUBLISHED
                                    ? "bg-green-100 text-green-700"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                            >
                                Công khai
                            </button>
                            <button
                                onClick={() => onMyPostsStatusChange(PostStatus.ARCHIVED)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${myPostsStatus === PostStatus.ARCHIVED
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                            >
                                Lưu trữ
                            </button>
                        </>
                    )}
                </div>

                {/* Topic Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => onTopicSelect(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedTopic === null
                            ? "bg-primary text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                    >
                        Tất cả
                    </button>
                    {Object.entries(TOPIC_LABELS).map(([topic, label]) => (
                        <button
                            key={topic}
                            onClick={() => onTopicSelect(topic as PostTopic)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedTopic === topic
                                ? "bg-primary text-white"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
