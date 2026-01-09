"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Edit, Trash2, BookOpen, HelpCircle, Loader2, ShoppingCart, CheckCircle, XCircle, MoreVertical, Flag, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudySetDetail, useStudySetMutation } from "@/hooks/useStudySet";
import { studySetService } from "@/services/studySet.service";
import { Comment, TargetType } from "@/types/forum";
import { CommentItem } from "@/app/(user)/forum/_components/comments/CommentItem";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function StudySetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { studySet, isLoading, error, revalidate } = useStudySetDetail(id);
  const { isLoading: isMutating, remove, purchase } = useStudySetMutation();
  const searchParams = useSearchParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);

  // Comment & Like State
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentReplies, setCommentReplies] = useState<Record<number, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyToUsername, setReplyToUsername] = useState<string>("");
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);
  const [localIsLiked, setLocalIsLiked] = useState<boolean | null>(null);

  // Sync local state with studySet data
  useEffect(() => {
    if (studySet) {
      setLocalLikeCount(studySet.likeCount);
      setLocalIsLiked(studySet.isAlreadyLike);
    }
  }, [studySet]);

  // Check for payment result from VNPay redirect
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
      revalidate(); // Refresh to get updated isPurchased status
      // Clear query param
      router.replace(`/study-sets/${id}`, { scroll: false });
    } else if (payment === 'failed') {
      setPaymentStatus('failed');
      router.replace(`/study-sets/${id}`, { scroll: false });
    }
  }, [searchParams, id, router, revalidate]);

  // Get current user from auth
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const isOwner = studySet && currentUserId !== null && currentUserId === studySet.owner.id;
  const canAccess = studySet && (isOwner || studySet.isPurchased || Math.floor(studySet.price) === 0);

  const handleDelete = async () => {
    const success = await remove(id);
    if (success) {
      router.push("/study-sets");
    }
  };

  const handlePurchase = async () => {
    const result = await purchase(id);
    if (result) {
      if (result.isFree) {
        revalidate();
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    }
  };

  const handleReport = () => {
    // TODO: Implement report feature
    alert("Đã gửi báo cáo vi phạm. Cảm ơn phản hồi của bạn!");
    setShowMenu(false);
  };

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;
      setCommentsLoading(true);
      try {
        const response = await studySetService.getComments(id, "null", TargetType.STUDY_SET);
        const allComments = response.metaData;
        const topLevelComments = allComments.filter(c => !c.parentComment);
        setComments(topLevelComments);

        // Load replies
        const repliesMap: Record<number, Comment[]> = {};
        const allReplyIds = new Set<number>();

        for (const parent of topLevelComments) {
            try {
                const repliesResponse = await studySetService.getComments(id, parent.id, TargetType.STUDY_SET);
                const replies = repliesResponse.metaData;
                repliesMap[parent.id] = replies;
                replies.forEach(r => allReplyIds.add(r.id));
            } catch (err) {
                repliesMap[parent.id] = [];
            }
        }
        
        // Filter again to be sure
        const finalTopLevel = topLevelComments.filter(c => !allReplyIds.has(c.id));
        setComments(finalTopLevel);
        setCommentReplies(repliesMap);
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        setCommentsLoading(false);
      }
    };
    loadComments();
  }, [id]);

  const handleLike = async () => {
    if (localIsLiked === null || localLikeCount === null) return;
    
    const isLiked = localIsLiked;
    const currentCount = localLikeCount;
    // Optimistic update
    setLocalIsLiked(!isLiked);
    setLocalLikeCount(isLiked ? Math.max(0, currentCount - 1) : currentCount + 1);

    try {
      if (isLiked) {
        await studySetService.unlikeStudySet(id);
      } else {
        await studySetService.likeStudySet(id);
      }
      revalidate(); 
    } catch (err) {
       // Revert
       setLocalIsLiked(isLiked);
       setLocalLikeCount(currentCount);
       toast.error("Không thể thích học liệu");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
        const content = replyToUsername
            ? `@${replyToUsername} ${commentText.trim()}`
            : commentText.trim();

        await studySetService.createComment(
            id,
            { content, parentId: replyToId },
            TargetType.STUDY_SET
        );

        // Reload comments (simplified: strict reload)
        const response = await studySetService.getComments(id, "null", TargetType.STUDY_SET);
        const allComments = response.metaData;
        const topLevelComments = allComments.filter(c => !c.parentComment);
        
        const repliesMap: Record<number, Comment[]> = {};
        const allReplyIds = new Set<number>();
        
         for (const parent of topLevelComments) {
            try {
                const repliesResponse = await studySetService.getComments(id, parent.id, TargetType.STUDY_SET);
                const replies = repliesResponse.metaData;
                repliesMap[parent.id] = replies;
                replies.forEach(r => allReplyIds.add(r.id));
            } catch (err) {
                repliesMap[parent.id] = [];
            }
        }
        
        const finalTopLevel = topLevelComments.filter(c => !allReplyIds.has(c.id));
        setComments(finalTopLevel);
        setCommentReplies(repliesMap);

        if (replyToId) {
            setExpandedComments(prev => new Set(prev).add(replyToId));
        }

        setCommentText("");
        setReplyToId(null);
        setReplyToUsername("");
        setReplyToCommentId(null);
        revalidate(); // Update comment count
        toast.success("Đã thêm bình luận");
    } catch (err) {
        toast.error("Không thể thêm bình luận");
    } finally {
        setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
      if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
      try {
          await studySetService.deleteComment(commentId);
          setComments(prev => prev.filter(c => c.id !== commentId));
          // Note: if it was a reply, we'd need to update commentReplies too, but simplicity for now
           // Ideally re-fetch comments
          toast.success("Đã xóa bình luận");
           revalidate();
      } catch (err) {
          toast.error("Không thể xóa bình luận");
      }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-[var(--error)]">Không tìm thấy học liệu</p>
        <button
          onClick={() => router.push("/study-sets")}
          className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--neutral-50)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--neutral-200)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/study-sets")}
            className="flex items-center gap-2 text-[var(--neutral-600)] hover:text-[var(--neutral-900)] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Payment Status Toast */}
        {paymentStatus && (
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl",
              paymentStatus === "success"
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--error)]/10 text-[var(--error)]"
            )}
          >
            {paymentStatus === "success" ? (
              <>
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Thanh toán thành công! Bạn có thể bắt đầu học ngay.</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Thanh toán thất bại. Vui lòng thử lại.</span>
              </>
            )}
            <button
              onClick={() => setPaymentStatus(null)}
              className="ml-auto text-sm font-medium hover:underline"
            >
              Đóng
            </button>
          </div>
        )}
        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--neutral-200)] p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
                {studySet.title}
              </h1>
              <p className={cn(
                "text-lg font-semibold mt-1",
                Math.floor(studySet.price) === 0 ? "text-[var(--success)]" : "text-[var(--primary-500)]"
              )}>
                {Math.floor(studySet.price) === 0 ? "Miễn phí" : `${Math.floor(studySet.price).toLocaleString("vi-VN")}đ`}
              </p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-[var(--neutral-100)] text-[var(--neutral-600)] transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--neutral-200)] py-1 z-20 overflow-hidden">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => {
                            router.push(`/study-sets/${id}/edit`);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(true);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--error)] hover:bg-[var(--error)]/5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa học liệu
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleReport}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        Báo cáo vi phạm
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {studySet.description && (
            <p className="text-[var(--neutral-600)] mb-4">
              {studySet.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
              {studySet.totalFlashcards} thẻ
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--info)]/10 text-[var(--info)]">
              {studySet.totalQuizzes} câu hỏi
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--neutral-100)]">
            <span className="text-sm text-[var(--neutral-600)]">
              Tác giả: @{studySet.owner.username}
            </span>
            <div className="flex items-center gap-4 text-sm text-[var(--neutral-600)]">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {studySet.commentCount}
              </span>
              <button 
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1 hover:text-[var(--error)] transition-colors",
                  localIsLiked && "text-[var(--error)]"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    localIsLiked && "fill-[var(--error)]"
                  )}
                />
                {localLikeCount ?? studySet.likeCount}
              </button>
            </div>
          </div>
        </div>

        {/* Owner Actions removed - moved to dropdown */}

        {/* Purchase CTA */}
        {!canAccess && (
          <button
            onClick={handlePurchase}
            disabled={isMutating}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isMutating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                {studySet.price === 0
                  ? "Thêm vào thư viện (Miễn phí)"
                  : `Mua ngay - ${Math.floor(studySet.price).toLocaleString("vi-VN")}đ`}
              </>
            )}
          </button>
        )}

        {/* Learning Modes */}
        {canAccess && (
          <>
            <h2 className="text-xl font-bold text-[var(--neutral-900)]">
              Chọn chế độ học
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Flashcard Mode */}
              <div className="bg-white rounded-xl border border-[var(--neutral-200)] p-5 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--neutral-900)]">
                      Flashcard
                    </h3>
                    <p className="text-sm text-[var(--neutral-600)]">
                      Học từ vựng qua thẻ ghi nhớ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/study-sets/${id}/flashcard`)}
                  disabled={studySet.totalFlashcards === 0}
                  className={cn(
                    "w-full py-2.5 rounded-lg font-medium transition-colors",
                    studySet.totalFlashcards > 0
                      ? "bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)]"
                      : "bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed"
                  )}
                >
                  Bắt đầu Flashcard
                </button>
              </div>

              {/* Quiz Mode */}
              <div className="bg-white rounded-xl border border-[var(--neutral-200)] p-5 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--info)] to-blue-600 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--neutral-900)]">
                      Quiz
                    </h3>
                    <p className="text-sm text-[var(--neutral-600)]">
                      Kiểm tra với câu hỏi trắc nghiệm
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/study-sets/${id}/quiz`)}
                  disabled={studySet.totalQuizzes === 0}
                  className={cn(
                    "w-full py-2.5 rounded-lg font-medium transition-colors",
                    studySet.totalQuizzes > 0
                      ? "bg-[var(--info)] text-white hover:opacity-90"
                      : "bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed"
                  )}
                >
                  Bắt đầu Quiz
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Comments Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--neutral-200)] space-y-4">
             <h2 className="text-lg font-semibold text-[var(--neutral-900)]">
                Bình luận ({comments.length})
            </h2>

             {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
                {replyToId && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-[var(--neutral-600)] bg-blue-50 px-3 py-2 rounded-lg">
                        <span>Đang trả lời bình luận</span>
                        <button
                            type="button"
                            onClick={() => {
                                setReplyToId(null);
                                setReplyToUsername("");
                                setReplyToCommentId(null);
                            }}
                            className="ml-auto text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Hủy
                        </button>
                    </div>
                )}
                <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {user?.username ? user.username[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Viết bình luận..."
                            className="w-full px-3 py-2 border border-[var(--neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <Button type="submit" disabled={!commentText.trim() || submittingComment}>
                                {submittingComment ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
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
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-500)]" />
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replies={commentReplies[comment.id] || []}
                            currentUserId={user?.id}
                            onReply={(commentId, parentId, username) => {
                                setReplyToId(parentId);
                                setReplyToUsername(username);
                                setReplyToCommentId(commentId);
                                setExpandedComments(prev => new Set(prev).add(parentId));
                            }}
                            onDelete={handleDeleteComment}
                            isExpanded={expandedComments.has(comment.id)}
                            onToggleExpand={() => {
                                setExpandedComments(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(comment.id)) {
                                        newSet.delete(comment.id);
                                    } else {
                                        newSet.add(comment.id);
                                    }
                                    return newSet;
                                });
                            }}
                            replyingTo={replyToCommentId ? { parentId: replyToId!, username: replyToUsername, commentId: replyToCommentId } : null}
                            onSubmitReply={async (content) => {
                                 setSubmittingComment(true);
                                 try {
                                     const finalContent = `@${replyToUsername} ${content}`;
                                     await studySetService.createComment(
                                         id,
                                         { content: finalContent, parentId: replyToId },
                                         TargetType.STUDY_SET
                                     );
                                    
                                     // Refetch logic (duplicated for now due to complexity of extracting hook immediately)
                                     const response = await studySetService.getComments(id, "null", TargetType.STUDY_SET);
                                     const allComments = response.metaData;
                                     const topLevelComments = allComments.filter(c => !c.parentComment);
                                     
                                     const repliesMap: Record<number, Comment[]> = {};
                                     const allReplyIds = new Set<number>();
                                     
                                     for (const parent of topLevelComments) {
                                         try {
                                             const repliesResponse = await studySetService.getComments(id, parent.id, TargetType.STUDY_SET);
                                             const replies = repliesResponse.metaData;
                                             repliesMap[parent.id] = replies;
                                             replies.forEach(r => allReplyIds.add(r.id));
                                         } catch (err) {
                                             repliesMap[parent.id] = [];
                                         }
                                     }
                                     const finalTopLevel = topLevelComments.filter(c => !allReplyIds.has(c.id));
                                     setComments(finalTopLevel);
                                     setCommentReplies(repliesMap);
                                     
                                     setReplyToId(null);
                                     setReplyToUsername("");
                                     setReplyToCommentId(null);
                                     revalidate();
                                     toast.success("Đã thêm phản hồi");
                                 } catch (err) {
                                     toast.error("Không thể thêm phản hồi");
                                 } finally {
                                     setSubmittingComment(false);
                                 }
                            }}
                            onCancelReply={() => {
                                setReplyToId(null);
                                setReplyToUsername("");
                                setReplyToCommentId(null);
                            }}
                            submittingReply={submittingComment}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-[var(--neutral-600)] py-8">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
            )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[var(--neutral-900)] mb-2">
              Xóa học liệu?
            </h3>
            <p className="text-[var(--neutral-600)] mb-6">
              Bạn có chắc chắn muốn xóa học liệu này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--neutral-200)] text-[var(--neutral-700)] font-medium hover:bg-[var(--neutral-50)]"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isMutating}
                className="flex-1 py-2.5 rounded-lg bg-[var(--error)] text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isMutating ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

