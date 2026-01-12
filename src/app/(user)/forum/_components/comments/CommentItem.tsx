import { Comment } from "@/types/forum";
import { formatTimeAgo } from "@/utils/date";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineReplyForm } from "./InlineReplyForm";
import { ReportDialog } from "@/components/shared/ReportDialog";
import { TargetType } from "@/types/report";

interface CommentItemProps {
    comment: Comment;
    replies?: Comment[];
    currentUserId?: number;
    onReply: (commentId: number, parentId: number, username: string) => void;
    onDelete: (commentId: number) => void;
    onEdit?: (commentId: number, newContent: string) => Promise<void>;
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
    onEdit,
    isExpanded,
    onToggleExpand,
    replyingTo,
    onSubmitReply,
    onCancelReply,
    submittingReply,
}: CommentItemProps) {
    const isOwner = comment.createdBy.id === currentUserId;
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [replyReportDialogs, setReplyReportDialogs] = useState<Record<number, boolean>>({});
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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

    const handleStartEdit = (commentId: number, currentContent: string) => {
        setEditingCommentId(commentId);
        setEditContent(currentContent);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleSaveEdit = async (commentId: number) => {
        if (!editContent.trim() || !onEdit) return;

        setIsSubmittingEdit(true);
        try {
            await onEdit(commentId, editContent.trim());
            setEditingCommentId(null);
            setEditContent("");
        } catch (error) {
            console.error("Failed to edit comment:", error);
        } finally {
            setIsSubmittingEdit(false);
        }
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 hover:bg-neutral-200 rounded">
                                        <MoreVertical className="w-4 h-4 text-neutral-600" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {isOwner ? (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    handleStartEdit(comment.id, comment.content);
                                                }}
                                            >
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(comment.id)}
                                                className="text-red-600"
                                            >
                                                Xóa
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                                            Báo cáo vi phạm
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {editingCommentId === comment.id ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={3}
                                    placeholder="Chỉnh sửa bình luận..."
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleSaveEdit(comment.id)}
                                        disabled={!editContent.trim() || isSubmittingEdit}
                                        className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingEdit ? "Đang lưu..." : "Lưu"}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSubmittingEdit}
                                        className="px-3 py-1 bg-neutral-200 text-neutral-700 text-sm rounded-lg hover:bg-neutral-300 disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-700">{formatContent(comment.content)}</p>
                        )}
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
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-xs text-neutral-900">
                                                    {reply.createdBy.username}
                                                </p>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1 hover:bg-neutral-200 rounded">
                                                            <MoreVertical className="w-3 h-3 text-neutral-600" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {reply.createdBy.id === currentUserId ? (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        handleStartEdit(reply.id, reply.content);
                                                                    }}
                                                                >
                                                                    Chỉnh sửa
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => onDelete(reply.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    Xóa
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setReplyReportDialogs(prev => ({ ...prev, [reply.id]: true }));
                                                                }}
                                                            >
                                                                Báo cáo vi phạm
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            {editingCommentId === reply.id ? (
                                                <div className="mt-2">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full p-2 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                                        rows={2}
                                                        placeholder="Chỉnh sửa phản hồi..."
                                                    />
                                                    <div className="flex gap-2 mt-1">
                                                        <button
                                                            onClick={() => handleSaveEdit(reply.id)}
                                                            disabled={!editContent.trim() || isSubmittingEdit}
                                                            className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isSubmittingEdit ? "Đang lưu..." : "Lưu"}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={isSubmittingEdit}
                                                            className="px-2 py-1 bg-neutral-200 text-neutral-700 text-xs rounded hover:bg-neutral-300 disabled:opacity-50"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-neutral-700">{formatContent(reply.content)}</p>
                                            )}
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

                                        {/* Report Dialog for this reply */}
                                        <ReportDialog
                                            targetType={TargetType.COMMENT}
                                            targetId={reply.id}
                                            open={replyReportDialogs[reply.id] || false}
                                            onOpenChange={(open) => {
                                                setReplyReportDialogs(prev => ({ ...prev, [reply.id]: open }));
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Dialog */}
            <ReportDialog
                targetType={TargetType.COMMENT}
                targetId={comment.id}
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
            />
        </div>
    );
}
