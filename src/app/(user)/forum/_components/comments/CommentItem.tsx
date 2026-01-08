import { Comment } from "@/types/forum";
import { formatTimeAgo } from "@/utils/date";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineReplyForm } from "./InlineReplyForm";

interface CommentItemProps {
    comment: Comment;
    replies?: Comment[];
    currentUserId?: number;
    onReply: (commentId: number, parentId: number, username: string) => void;
    onDelete: (commentId: number) => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    replyingTo?: { parentId: number; username: string; commentId: number } | null;
    onSubmitReply?: (content: string) => void;
    onCancelReply?: () => void;
    submittingReply?: boolean;
}

export function CommentItem({
    comment,
    replies = [],
    currentUserId,
    onReply,
    onDelete,
    isExpanded,
    onToggleExpand,
    replyingTo,
    onSubmitReply,
    onCancelReply,
    submittingReply,
}: CommentItemProps) {
    const isOwner = comment.createdBy.id === currentUserId;

    // Format content to bold @mentions
    const formatContent = (content: string) => {
        // Match @ followed by any non-whitespace characters (supports Unicode/Vietnamese)
        const mentionRegex = /@(\S+?)(?=\s|$)/g;
        const parts = content.split(mentionRegex);

        return parts.map((part, index) => {
            if (index % 2 === 1) {
                // This is a username (captured group)
                return <strong key={index} className="font-semibold text-primary">@{part}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-3">
                {comment.createdBy.avatar && comment.createdBy.avatar !== "N/A" ? (
                    <img
                        src={comment.createdBy.avatar}
                        alt={comment.createdBy.username}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                e.currentTarget.remove();
                                const fallback = document.createElement('div');
                                fallback.className = 'w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0';
                                fallback.textContent = comment.createdBy.username[0].toUpperCase();
                                parent.insertBefore(fallback, parent.firstChild);
                            }
                        }}
                    />
                ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {comment.createdBy.username[0].toUpperCase()}
                    </div>
                )}
                <div className="flex-1">
                    <div className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm text-neutral-900">
                                {comment.createdBy.username}
                            </p>
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 hover:bg-neutral-200 rounded">
                                            <MoreVertical className="w-4 h-4 text-neutral-600" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => onDelete(comment.id)}
                                            className="text-red-600"
                                        >
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                        <p className="text-sm text-neutral-700">{formatContent(comment.content)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                        <span>{formatTimeAgo(comment.createdAt)}</span>
                        <button
                            onClick={() => onReply(comment.id, comment.id, comment.createdBy.username)}
                            className="hover:text-primary font-medium"
                        >
                            Trả lời
                        </button>
                        {replies.length > 0 && onToggleExpand && (
                            <button
                                onClick={onToggleExpand}
                                className="hover:text-primary font-medium"
                            >
                                {isExpanded ? `Ẩn ${replies.length} phản hồi` : `Xem ${replies.length} phản hồi`}
                            </button>
                        )}
                    </div>

                    {/* Inline Reply Form for parent comment */}
                    {replyingTo && replyingTo.commentId === comment.id && onSubmitReply && onCancelReply && (
                        <InlineReplyForm
                            parentId={comment.id}
                            targetUsername={replyingTo.username}
                            onSubmit={onSubmitReply}
                            onCancel={onCancelReply}
                            submitting={submittingReply || false}
                        />
                    )}

                    {/* Nested Replies */}
                    {isExpanded && replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3 border-l-2 border-neutral-200 pl-4">
                            {replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                    {reply.createdBy.avatar && reply.createdBy.avatar !== "N/A" ? (
                                        <img
                                            src={reply.createdBy.avatar}
                                            alt={reply.createdBy.username}
                                            className="w-6 h-6 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                            {reply.createdBy.username[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="bg-neutral-50 rounded-lg p-2">
                                            <p className="font-medium text-xs text-neutral-900 mb-1">
                                                {reply.createdBy.username}
                                            </p>
                                            <p className="text-xs text-neutral-700">{formatContent(reply.content)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                            <span>{formatTimeAgo(reply.createdAt)}</span>
                                            <button
                                                onClick={() => onReply(reply.id, comment.id, reply.createdBy.username)}
                                                className="hover:text-primary font-medium"
                                            >
                                                Trả lời
                                            </button>
                                        </div>

                                        {/* Inline Reply Form for nested reply */}
                                        {replyingTo && replyingTo.commentId === reply.id && onSubmitReply && onCancelReply && (
                                            <InlineReplyForm
                                                parentId={comment.id}
                                                targetUsername={replyingTo.username}
                                                onSubmit={onSubmitReply}
                                                onCancel={onCancelReply}
                                                submitting={submittingReply || false}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
