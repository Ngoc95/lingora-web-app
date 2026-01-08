"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, MoreVertical, Send, Loader2 } from "lucide-react";
import { Post, PostTopic, Comment, TargetType, PostStatus } from "@/types/forum";
import { forumService } from "@/services/forum.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TOPIC_LABELS } from "@/constants/forum";
import { formatTimeAgo } from "@/utils/date";
import { CommentItem } from "../_components/comments/CommentItem";
import { CreatePostDialog } from "../_components/CreatePostDialog";
import { CreatePostRequest } from "@/types/forum";
import { ImageGallery } from "../_components/ImageGallery";

export default function PostDetailPage() {
    const router = useRouter();
    const params = useParams();
    const postId = parseInt(params.id as string);

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentReplies, setCommentReplies] = useState<Record<number, Comment[]>>({});
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | undefined>();
    const [commentText, setCommentText] = useState("");
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [replyToUsername, setReplyToUsername] = useState<string>("");
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null); // Track specific comment being replied to

    const [submitting, setSubmitting] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Get current user ID
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    setCurrentUserId(payload.userId);
                } catch (e) {
                    console.error("Failed to parse token:", e);
                }
            }
        }
    }, []);

    // Load post
    useEffect(() => {
        const loadPost = async () => {
            try {
                const response = await forumService.getPostById(postId);
                setPost(response.metaData);
            } catch (err: any) {
                toast.error("Không thể tải bài viết");
                router.push("/forum");
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [postId, router]);

    // Load comments with replies
    useEffect(() => {
        const loadComments = async () => {
            setCommentsLoading(true);
            try {
                // Load parent comments (only top-level, no parentId)
                const response = await forumService.getComments(postId, "null", TargetType.POST);
                const allComments = response.metaData;

                // Filter to get only top-level comments (those without parentComment or parentComment is null)
                const topLevelComments = allComments.filter(c => !c.parentComment);
                setComments(topLevelComments);

                // Load replies for each parent comment
                const repliesMap: Record<number, Comment[]> = {};
                const allReplyIds = new Set<number>();

                for (const parent of topLevelComments) {
                    try {
                        const repliesResponse = await forumService.getComments(postId, parent.id, TargetType.POST);
                        const replies = repliesResponse.metaData;
                        repliesMap[parent.id] = replies;
                        // Track all reply IDs to filter them out from top level
                        replies.forEach(r => allReplyIds.add(r.id));
                    } catch (err) {
                        repliesMap[parent.id] = [];
                    }
                }

                // Double-check: remove any comments that are actually replies
                const finalTopLevel = topLevelComments.filter(c => !allReplyIds.has(c.id));
                setComments(finalTopLevel);
                setCommentReplies(repliesMap);
            } catch (err: any) {
                console.error("Failed to load comments:", err);
            } finally {
                setCommentsLoading(false);
            }
        };

        if (postId) {
            loadComments();
        }
    }, [postId]);

    const handleLike = async () => {
        if (!post) return;

        const isLiked = post.isAlreadyLike;
        const delta = isLiked ? -1 : 1;

        // Optimistic update
        setPost({
            ...post,
            isAlreadyLike: !isLiked,
            likeCount: Math.max(0, post.likeCount + delta),
        });

        try {
            if (isLiked) {
                await forumService.unlikePost(postId);
            } else {
                await forumService.likePost(postId);
            }
        } catch (err: any) {
            // Revert on error
            setPost({
                ...post,
                isAlreadyLike: isLiked,
                likeCount: Math.max(0, post.likeCount - delta),
            });
            toast.error("Không thể thực hiện thao tác");
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            // Build content with @mention if replying
            const content = replyToUsername
                ? `@${replyToUsername} ${commentText.trim()}`
                : commentText.trim();

            await forumService.createComment(
                postId,
                {
                    content,
                    parentId: replyToId,
                },
                TargetType.POST
            );

            // Reload comments with proper filtering
            const response = await forumService.getComments(postId, "null", TargetType.POST);
            const allComments = response.metaData;

            // Filter to get only top-level comments (no parent)
            const topLevelComments = allComments.filter(c => !c.parentComment);

            // Reload replies for each parent and collect all reply IDs
            const repliesMap: Record<number, Comment[]> = {};
            const allReplyIds = new Set<number>();

            for (const parent of topLevelComments) {
                try {
                    const repliesResponse = await forumService.getComments(postId, parent.id, TargetType.POST);
                    const replies = repliesResponse.metaData;
                    repliesMap[parent.id] = replies;
                    // Track all reply IDs to filter them out
                    replies.forEach(r => allReplyIds.add(r.id));
                } catch (err) {
                    repliesMap[parent.id] = [];
                }
            }

            // Final filter: remove any comments that are actually replies
            const finalTopLevel = topLevelComments.filter(c => !allReplyIds.has(c.id));

            setComments(finalTopLevel);
            setCommentReplies(repliesMap);

            // If replied to a comment, expand it to show the new reply
            if (replyToId) {
                setExpandedComments(prev => new Set(prev).add(replyToId));
            }

            setCommentText("");
            setReplyToId(null);
            setReplyToUsername("");

            // Update comment count
            if (post) {
                setPost({ ...post, commentCount: post.commentCount + 1 });
            }

            toast.success("Đã thêm bình luận");
        } catch (err: any) {
            toast.error("Không thể thêm bình luận");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

        try {
            await forumService.deleteComment(commentId);
            setComments(comments.filter((c) => c.id !== commentId));

            if (post) {
                setPost({ ...post, commentCount: Math.max(0, post.commentCount - 1) });
            }

            toast.success("Đã xóa bình luận");
        } catch (err: any) {
            toast.error("Không thể xóa bình luận");
        }
    };

    const handleUpdatePost = async (data: CreatePostRequest) => {
        if (!post) return;
        try {
            await forumService.updatePost(post.id, data);

            // Refresh post data
            const response = await forumService.getPostById(postId);
            setPost(response.metaData);

            setEditDialogOpen(false);
            toast.success("Đã cập nhật bài viết");
        } catch (error) {
            toast.error("Không thể cập nhật bài viết");
        }
    };

    const handleStatusChange = async (newStatus: PostStatus) => {
        if (!post) return;
        try {
            await forumService.updatePost(post.id, { status: newStatus });
            setPost({ ...post, status: newStatus });
            toast.success(newStatus === PostStatus.ARCHIVED ? "Đã lưu trữ bài viết" : "Đã bỏ lưu trữ bài viết");
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    const handleDeletePost = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
        try {
            await forumService.deletePost(postId);
            toast.success("Đã xóa bài viết");
            router.push("/forum");
        } catch (error) {
            toast.error("Không thể xóa bài viết");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!post) {
        return null;
    }

    const isOwner = post.createdBy.id === currentUserId;

    return (
        <div className="min-h-screen bg-neutral-100/50 pb-20">
            {post && (
                <CreatePostDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onSubmit={handleUpdatePost}
                    initialData={post}
                />
            )}
            {/* Header */}
            <div className="bg-white border-b border-neutral-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Quay lại</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Post Content */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 mb-6">
                    {/* Author */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {post.createdBy.avatar && post.createdBy.avatar !== "N/A" ? (
                                <img
                                    src={post.createdBy.avatar}
                                    alt={post.createdBy.username}
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                    onError={(e) => {
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            e.currentTarget.remove();
                                            const fallback = document.createElement('div');
                                            fallback.className = 'w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold shrink-0';
                                            fallback.textContent = post.createdBy.username[0].toUpperCase();
                                            parent.insertBefore(fallback, parent.firstChild);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold shrink-0">
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

                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 hover:bg-neutral-100 rounded-lg">
                                        <MoreVertical className="w-5 h-5 text-neutral-600" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            const targetStatus = post.status === PostStatus.ARCHIVED
                                                ? PostStatus.PUBLISHED
                                                : PostStatus.ARCHIVED;
                                            handleStatusChange(targetStatus);
                                        }}
                                    >
                                        {post.status === PostStatus.ARCHIVED ? "Bỏ lưu trữ" : "Lưu trữ"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDeletePost} className="text-red-600">
                                        Xóa
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                        {post.title}
                    </h1>

                    {/* Content */}
                    <div className="text-neutral-700 mb-4 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    {/* Content Images */}
                    {post.thumbnails && post.thumbnails.length > 0 && (
                        <div className="mb-6">
                            <ImageGallery images={post.thumbnails} />
                        </div>
                    )}

                    {/* Topic & Tags */}
                    < div className="flex flex-wrap gap-2 mb-4">
                        {post.topic && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md font-medium">
                                {TOPIC_LABELS[post.topic as PostTopic] || post.topic}
                            </span>
                        )}
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-md"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${post.isAlreadyLike
                                ? "bg-red-50 text-red-600"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                        >
                            <Heart
                                className={`w-5 h-5 ${post.isAlreadyLike ? "fill-current" : ""}`}
                            />
                            <span className="font-medium">{post.likeCount}</span>
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg text-neutral-600">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">{post.commentCount}</span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                        Bình luận ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="mb-6">
                        {replyToId && (
                            <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600 bg-blue-50 px-3 py-2 rounded-lg">
                                <span>Đang trả lời bình luận</span>
                                <button
                                    type="button"
                                    onClick={() => setReplyToId(null)}
                                    className="ml-auto text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                {currentUserId ? "U" : "?"}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Viết bình luận..."
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-2">
                                    <Button type="submit" disabled={!commentText.trim() || submitting}>
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Gửi
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    {commentsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    replies={commentReplies[comment.id] || []}
                                    currentUserId={currentUserId}
                                    onReply={(commentId, parentId, username) => {
                                        setReplyToId(parentId);
                                        setReplyToUsername(username);
                                        setReplyToCommentId(commentId);
                                        // Auto-expand the comment to show reply form
                                        setExpandedComments(prev => new Set(prev).add(parentId));
                                    }}
                                    onDelete={handleDeleteComment}
                                    isExpanded={expandedComments.has(comment.id)}
                                    onToggleExpand={() => {
                                        setExpandedComments(prev => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(comment.id)) {
                                                newSet.delete(comment.id);
                                                // Cancel reply if collapsing
                                                if (replyToCommentId && (replyToCommentId === comment.id || commentReplies[comment.id]?.some(r => r.id === replyToCommentId))) {
                                                    setReplyToId(null);
                                                    setReplyToUsername("");
                                                    setReplyToCommentId(null);
                                                }
                                            } else {
                                                newSet.add(comment.id);
                                            }
                                            return newSet;
                                        });
                                    }}
                                    replyingTo={replyToCommentId ? { parentId: replyToId!, username: replyToUsername, commentId: replyToCommentId } : null}
                                    onSubmitReply={async (content) => {
                                        setSubmitting(true);
                                        try {
                                            const finalContent = `@${replyToUsername} ${content}`;
                                            await forumService.createComment(
                                                postId,
                                                { content: finalContent, parentId: replyToId },
                                                TargetType.POST
                                            );

                                            // Reload comments with proper filtering
                                            const response = await forumService.getComments(postId, "null", TargetType.POST);
                                            const allComments = response.metaData;

                                            // First, identify all top-level comments (no parent)
                                            const topLevelComments = allComments.filter(c => !c.parentComment);

                                            // Load replies for each parent and collect all reply IDs
                                            const repliesMap: Record<number, Comment[]> = {};
                                            const allReplyIds = new Set<number>();

                                            for (const parent of topLevelComments) {
                                                try {
                                                    const repliesResponse = await forumService.getComments(postId, parent.id, TargetType.POST);
                                                    const replies = repliesResponse.metaData;
                                                    repliesMap[parent.id] = replies;
                                                    // Track all reply IDs
                                                    replies.forEach(r => allReplyIds.add(r.id));
                                                } catch (err) {
                                                    repliesMap[parent.id] = [];
                                                }
                                            }

                                            // Final filter: remove any comments that are actually replies
                                            const finalTopLevel = topLevelComments.filter(c => !allReplyIds.has(c.id));

                                            setComments(finalTopLevel);
                                            setCommentReplies(repliesMap);
                                            setReplyToId(null);
                                            setReplyToUsername("");
                                            setReplyToCommentId(null);

                                            if (post) {
                                                setPost({ ...post, commentCount: post.commentCount + 1 });
                                            }
                                            toast.success("Đã thêm phản hồi");
                                        } catch (err: any) {
                                            toast.error("Không thể thêm phản hồi");
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                    onCancelReply={() => {
                                        setReplyToId(null);
                                        setReplyToUsername("");
                                        setReplyToCommentId(null);
                                    }}
                                    submittingReply={submitting}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-neutral-500 py-8">
                            Chưa có bình luận nào. Hãy là người đầu tiên!
                        </p>
                    )}
                </div>
            </div>
        </div >
    );
}
