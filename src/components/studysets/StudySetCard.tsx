"use client";

import { BookOpen, Heart, MessageCircle, MoreVertical, Edit, Trash2, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudySet } from "@/types/studySet";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useStudySetMutation } from "@/hooks/useStudySet";
import { toast } from "sonner";

interface StudySetCardProps {
  studySet: StudySet;
  onClick?: () => void;
  className?: string;
}

export function StudySetCard({ studySet, onClick, className }: StudySetCardProps) {
  const isFree = Math.floor(studySet.price) === 0;
  const router = useRouter();
  const { user } = useAuth(); // Need to access auth context
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { remove, isLoading: isMutating } = useStudySetMutation();

  const isOwner = user?.id === studySet.owner.id;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/study-sets/${studySet.id}/edit`);
    setShowMenu(false);
  };

  const handleDelete = async () => { 
    // Call mutation to delete
    const success = await remove(studySet.id);
    if (success) {
      toast.success("Đã xóa học liệu");
      // The list will automatically updated by SWR mutation in hook
    } else {
        toast.error("Không thể xóa học liệu");
    }
    setShowDeleteConfirm(false);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Đã gửi báo cáo vi phạm. Cảm ơn phản hồi của bạn!");
    setShowMenu(false);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl p-5 shadow-sm border border-[var(--neutral-200)]",
        "hover:shadow-lg hover:border-[var(--primary-500)]/30 transition-all duration-300",
        "cursor-pointer group",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white flex-shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="font-semibold text-[var(--neutral-900)] group-hover:text-[var(--primary-500)] transition-colors line-clamp-1 text-base">
                    {studySet.title}
                </h3>
                <p className="text-sm text-[var(--neutral-600)]">
                    by @{studySet.owner.username}
                </p>
             </div>
             <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded-full hover:bg-[var(--neutral-100)] text-[var(--neutral-400)] transition-colors"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }} 
                        />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-[var(--neutral-200)] py-1 z-20 overflow-hidden">
                            {isOwner ? (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button>
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--error)]/5 transition-colors"
                  >
                      <Trash2 className="w-4 h-4" />
                      Xóa học liệu
                  </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors"
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
        </div>
      </div>

      {/* Description */}
      {studySet.description && (
        <p className="text-sm text-[var(--neutral-600)] mb-3 line-clamp-2">
          {studySet.description}
        </p>
      )}

      {/* Stats Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
          {studySet.totalFlashcards} thẻ
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--info)]/10 text-[var(--info)]">
          {studySet.totalQuizzes} câu hỏi
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--neutral-100)]">
        <div className="flex items-center gap-3 text-[var(--neutral-600)]">
          <span className="flex items-center gap-1">
            <Heart
              className={cn(
                "w-4 h-4",
                studySet.isAlreadyLike && "fill-[var(--error)] text-[var(--error)]"
              )}
            />
            {studySet.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {studySet.commentCount}
          </span>
        </div>
        <span
          className={cn(
            "font-semibold",
            isFree ? "text-[var(--success)]" : "text-[var(--primary-500)]"
          )}
        >
          {isFree ? "Miễn phí" : `${Math.floor(studySet.price).toLocaleString("vi-VN")}đ`}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-[var(--neutral-900)] mb-2">
              Xóa học liệu?
            </h3>
            <p className="text-[var(--neutral-600)] mb-6">
              Bạn có chắc chắn muốn xóa học liệu này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-lg border border-[var(--neutral-200)] text-[var(--neutral-700)] font-medium hover:bg-[var(--neutral-50)]"
              >
                Hủy
              </button>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                }}
                disabled={isMutating}
                className="flex-1 py-2.5 rounded-lg bg-[var(--error)] text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isMutating ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
