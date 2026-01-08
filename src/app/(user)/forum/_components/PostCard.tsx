"use client";

import { Post, PostTopic, PostStatus } from "@/types/forum";
import { Heart, MessageCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import { ImageGallery } from "./ImageGallery"; // Import ImageGallery
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TOPIC_LABELS } from "@/constants/forum";
import { formatTimeAgo } from "@/utils/date";

interface PostCardProps {
    post: Post;
    currentUserId?: number;
    isViewingArchived?: boolean;
    onClick: () => void;
    onLikeClick: () => void;
    onEditPost: () => void;
    onChangeStatus: (status: PostStatus) => void;
    onDeletePost: () => void;
    onTopicClick?: (topic: PostTopic) => void;
    onTagClick?: (tag: string) => void;
}

export function PostCard({
    post,
    currentUserId,
    isViewingArchived = false,
    onClick,
    onLikeClick,
    onEditPost,
    onChangeStatus,
    onDeletePost,
    onTopicClick,
    onTagClick,
}: PostCardProps) {
    const isOwner = post.createdBy.id === currentUserId;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLikeClick();
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleTopicClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onTopicClick && post.topic) {
            onTopicClick(post.topic);
        }
    };

    const handleTagClick = (e: React.MouseEvent, tag: string) => {
        e.stopPropagation();
        if (onTagClick) {
            onTagClick(tag);
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {post.createdBy.avatar && post.createdBy.avatar !== "N/A" ? (
                        <img
                            src={post.createdBy.avatar}
                            alt={post.createdBy.username}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                            onError={(e) => {
                                // Replace with fallback on error
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    e.currentTarget.remove();
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold shrink-0';
                                    fallback.textContent = post.createdBy.username[0].toUpperCase();
                                    parent.insertBefore(fallback, parent.firstChild);
                                }
                            }}
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                            {post.createdBy.username[0].toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-neutral-900">
                            {post.createdBy.username}
                        </p>
                        <p className="text-sm text-neutral-500">
                            {formatTimeAgo(post.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Menu */}
                <div onClick={handleMenuClick}>
                    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5 text-neutral-600" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isOwner ? (
                                <>
                                    <DropdownMenuItem onClick={onEditPost}>
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            const targetStatus =
                                                isViewingArchived || post.status === PostStatus.ARCHIVED
                                                    ? PostStatus.PUBLISHED
                                                    : PostStatus.ARCHIVED;
                                            onChangeStatus(targetStatus);
                                        }}
                                    >
                                        {isViewingArchived || post.status === PostStatus.ARCHIVED
                                            ? "Bỏ lưu trữ"
                                            : "Lưu trữ"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={onDeletePost}
                                        className="text-red-600"
                                    >
                                        Xóa
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem>Báo cáo vi phạm</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Topic Badge - Show at top */}
            {post.topic && (
                <button
                    onClick={handleTopicClick}
                    className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium hover:bg-blue-200 transition-colors"
                >
                    {TOPIC_LABELS[post.topic as PostTopic] || post.topic}
                </button>
            )}

            {/* Content */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>
                <p className="text-neutral-600 line-clamp-3">{post.content}</p>
            </div>

            {/* Images */}
            {post.thumbnails && post.thumbnails.length > 0 && (
                <div className="mb-4">
                    <ImageGallery images={post.thumbnails} />
                </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                        <button
                            key={tag}
                            onClick={(e) => handleTagClick(e, tag)}
                            className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md hover:bg-neutral-200 transition-colors"
                        >
                            #{tag}
                        </button>
                    ))}
                    {post.tags.length > 3 && (
                        <span className="px-2 py-1 text-neutral-500 text-xs">
                            +{post.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                <button
                    onClick={handleLikeClick}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${post.isAlreadyLike
                        ? "text-red-500"
                        : "text-neutral-600 hover:text-red-500"
                        }`}
                >
                    <Heart
                        className={`w-5 h-5 ${post.isAlreadyLike ? "fill-current" : ""}`}
                    />
                    <span>{post.likeCount}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentCount}</span>
                </button>
            </div>
        </div>
    );
}
