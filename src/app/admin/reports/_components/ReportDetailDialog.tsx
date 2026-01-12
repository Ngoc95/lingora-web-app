"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
    Report,
    ReportStatus,
    ReportActionType,
    REPORT_STATUS_LABELS,
    REPORT_TYPE_LABELS,
    TARGET_TYPE_LABELS,
    REPORT_ACTION_LABELS,
    TargetType,
} from "@/types/report";
import { reportService } from "@/services/report.service";
import { forumService } from "@/services/forum.service";
import { studySetService } from "@/services/studySet.service";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatTimeAgo } from "@/utils/date";

interface ReportDetailDialogProps {
    report: Report | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    openInActionMode?: boolean;
}

export function ReportDetailDialog({
    report,
    open,
    onOpenChange,
    onSuccess,
    openInActionMode = false,
}: ReportDetailDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [deleteContent, setDeleteContent] = useState(false); // Optional, default false
    const [selectedUserAction, setSelectedUserAction] = useState<ReportActionType>(
        ReportActionType.WARN_USER
    );
    const [actionReason, setActionReason] = useState("");
    const [suspendDuration, setSuspendDuration] = useState("7");
    const [targetContent, setTargetContent] = useState<any>(null);
    const [parentPost, setParentPost] = useState<any>(null); // For comments, store parent post
    const [loadingContent, setLoadingContent] = useState(false);

    // Fetch target content when report changes
    useEffect(() => {
        const fetchTargetContent = async () => {
            if (!report || !open) return;

            setLoadingContent(true);
            try {
                if (report.targetType === TargetType.POST) {
                    const response = await forumService.getPostById(report.targetId);
                    setTargetContent(response.metaData);
                    setParentPost(null);
                } else if (report.targetType === TargetType.COMMENT) {
                    // Backend doesn't have getCommentById, so we need to work around this
                    // Try to get comment info from report or fetch from post comments
                    try {
                        const reportDetails = await reportService.getReportById(report.id);
                        setTargetContent(reportDetails.metaData.targetDetails || null);
                        setParentPost(reportDetails.metaData.parentContent || null);
                    } catch (err) {
                        console.error("Failed to fetch comment details:", err);
                        setTargetContent(null);
                        setParentPost(null);
                    }
                } else if (report.targetType === TargetType.STUDY_SET) {
                    const response = await studySetService.getById(report.targetId);
                    setTargetContent(response.metaData);
                    setParentPost(null);
                }
            } catch (error) {
                console.error("Failed to fetch target content:", error);
                setTargetContent(null);
            } finally {
                setLoadingContent(false);
            }
        };

        fetchTargetContent();
    }, [report, open]);

    // Auto-open action mode if requested
    useEffect(() => {
        if (open && openInActionMode && report?.status === ReportStatus.PENDING) {
            setShowActions(true);
        } else if (!open) {
            setShowActions(false);
        }
    }, [open, openInActionMode, report]);

    if (!report) return null;

    const handleAccept = () => {
        setShowActions(true);
    };

    const handleReject = async () => {
        setIsSubmitting(true);
        try {
            await reportService.updateReportStatus(report.id, ReportStatus.REJECTED);
            toast.success("Đã từ chối báo cáo");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Failed to reject report:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Không thể từ chối báo cáo";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitAction = async () => {
        setIsSubmitting(true);
        try {
            const actions = [];

            // Add delete content action if checked
            if (deleteContent) {
                actions.push({
                    type: ReportActionType.DELETE_CONTENT,
                    reason: actionReason.trim() || undefined,
                });
            }

            // Always add user action
            actions.push({
                type: selectedUserAction,
                reason: actionReason.trim() || undefined,
                duration:
                    selectedUserAction === ReportActionType.SUSPEND_USER
                        ? parseInt(suspendDuration)
                        : undefined,
            });

            await reportService.handleReport(report.id, {
                status: ReportStatus.ACCEPTED,
                actions,
            });

            toast.success("Đã xử lý báo cáo thành công");
            onOpenChange(false);
            setShowActions(false);
            setActionReason("");
            setSuspendDuration("7");
            onSuccess?.();
        } catch (error: any) {
            console.error("Failed to handle report:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Không thể xử lý báo cáo";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowActions(false);
        setActionReason("");
        setSuspendDuration("7");
        onOpenChange(false);
    };

    const getStatusIcon = () => {
        switch (report.status) {
            case ReportStatus.PENDING:
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case ReportStatus.ACCEPTED:
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case ReportStatus.REJECTED:
                return <XCircle className="w-5 h-5 text-red-600" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <div>
                            <DialogTitle>Chi tiết báo cáo #{report.id}</DialogTitle>
                            <DialogDescription>
                                {REPORT_STATUS_LABELS[report.status]}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {!showActions ? (
                    <div className="space-y-4">
                        {/* Report Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-neutral-500">
                                    Loại nội dung
                                </Label>
                                <p className="text-sm font-medium">
                                    {TARGET_TYPE_LABELS[report.targetType]} #{report.targetId}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">
                                    Loại vi phạm
                                </Label>
                                <p className="text-sm font-medium">
                                    {REPORT_TYPE_LABELS[report.reportType]}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">
                                    Người báo cáo
                                </Label>
                                <p className="text-sm font-medium">
                                    {report.createdBy.username}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">
                                    Thời gian
                                </Label>
                                <p className="text-sm font-medium">
                                    {formatTimeAgo(report.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <Label className="text-xs text-neutral-500">Lý do chi tiết</Label>
                            <div className="mt-1 p-3 bg-neutral-50 rounded-lg">
                                <p className="text-sm text-neutral-700">{report.reason}</p>
                            </div>
                        </div>

                        {/* Target Content Preview */}
                        <div>
                            <Label className="text-xs text-neutral-500">Nội dung bị báo cáo</Label>
                            <div className="mt-1 p-3 bg-neutral-50 rounded-lg border border-neutral-200 max-h-[300px] overflow-y-auto">
                                {loadingContent ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                                    </div>
                                ) : targetContent ? (
                                    <div className="space-y-2">
                                        {report.targetType === TargetType.POST && (
                                            <>
                                                {/* Post metadata */}
                                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200">
                                                    {targetContent.createdBy?.avatar && targetContent.createdBy.avatar !== "N/A" ? (
                                                        <img
                                                            src={targetContent.createdBy.avatar}
                                                            alt={targetContent.createdBy.username}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                            {targetContent.createdBy?.username?.[0]?.toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{targetContent.createdBy?.username || "Unknown"}</p>
                                                        <p className="text-xs text-neutral-500">
                                                            {new Date(targetContent.createdAt).toLocaleDateString("vi-VN")} • ID: {targetContent.id}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Post content */}
                                                <h4 className="font-semibold text-neutral-900 mb-2">{targetContent.title}</h4>
                                                <p className="text-sm text-neutral-700 whitespace-pre-wrap mb-2">{targetContent.content}</p>
                                                {/* Post images */}
                                                {targetContent.thumbnails && targetContent.thumbnails.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2 my-3">
                                                        {targetContent.thumbnails.slice(0, 4).map((img: string, idx: number) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`Image ${idx + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                                                            />
                                                        ))}
                                                        {targetContent.thumbnails.length > 4 && (
                                                            <div className="w-full h-32 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 text-sm font-medium">
                                                                +{targetContent.thumbnails.length - 4} ảnh
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Tags */}
                                                {targetContent.tags && targetContent.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {targetContent.tags.map((tag: string) => (
                                                            <span key={tag} className="px-2 py-0.5 bg-neutral-200 text-neutral-600 text-xs rounded">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {report.targetType === TargetType.COMMENT && targetContent && (
                                            <>
                                                <div className="mb-3 pb-3 border-b border-neutral-200">
                                                    <p className="text-xs text-neutral-500 mb-2">Bình luận bị báo cáo:</p>
                                                    {/* Commenter info */}
                                                    {targetContent.createdBy && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {targetContent.createdBy.avatar && targetContent.createdBy.avatar !== "N/A" ? (
                                                                <img
                                                                    src={targetContent.createdBy.avatar}
                                                                    alt={targetContent.createdBy.username}
                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                                    {targetContent.createdBy.username?.[0]?.toUpperCase() || "?"}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs font-medium">{targetContent.createdBy.username}</p>
                                                                {targetContent.createdAt && (
                                                                    <p className="text-xs text-neutral-500">
                                                                        {new Date(targetContent.createdAt).toLocaleDateString("vi-VN")} • ID: {targetContent.id}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-neutral-700 mb-1">{targetContent.content}</p>
                                                </div>
                                                {parentPost && (
                                                    <div>
                                                        <p className="text-xs text-neutral-500 mb-2">Bài viết chứa bình luận:</p>
                                                        {/* Post author info */}
                                                        {parentPost.createdBy && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {parentPost.createdBy.avatar && parentPost.createdBy.avatar !== "N/A" ? (
                                                                    <img
                                                                        src={parentPost.createdBy.avatar}
                                                                        alt={parentPost.createdBy.username}
                                                                        className="w-6 h-6 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                                        {parentPost.createdBy.username?.[0]?.toUpperCase() || "?"}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-xs font-medium">{parentPost.createdBy.username}</p>
                                                                    {parentPost.createdAt && (
                                                                        <p className="text-xs text-neutral-500">
                                                                            {new Date(parentPost.createdAt).toLocaleDateString("vi-VN")} • ID: {parentPost.id}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <h4 className="font-semibold text-neutral-900">{parentPost.title}</h4>
                                                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{parentPost.content}</p>
                                                        {parentPost.tags && parentPost.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {parentPost.tags.map((tag: string) => (
                                                                    <span key={tag} className="px-2 py-0.5 bg-neutral-200 text-neutral-600 text-xs rounded">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {report.targetType === TargetType.STUDY_SET && (
                                            <>
                                                {/* Study set metadata */}
                                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200">
                                                    {targetContent.createdBy?.avatar && targetContent.createdBy.avatar !== "N/A" ? (
                                                        <img
                                                            src={targetContent.createdBy.avatar}
                                                            alt={targetContent.createdBy.username}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                            {targetContent.createdBy?.username?.[0]?.toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{targetContent.createdBy?.username || "Unknown"}</p>
                                                        <p className="text-xs text-neutral-500">
                                                            {new Date(targetContent.createdAt).toLocaleDateString("vi-VN")} • ID: {targetContent.id}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Study set content */}
                                                <h4 className="font-semibold text-neutral-900 mb-2">{targetContent.title}</h4>
                                                <p className="text-sm text-neutral-700 mb-1">{targetContent.description}</p>
                                                <p className="text-xs text-neutral-500 mt-2">
                                                    {targetContent.wordCount || 0} từ vựng
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-500 italic">Không thể tải nội dung</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {report.status === ReportStatus.PENDING && (
                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Từ chối
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Chấp nhận & Xử lý
                                </Button>
                            </DialogFooter>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Content Action */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium mb-2 block">
                                Hành động với nội dung
                            </Label>
                            <div
                                className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                                onClick={() => setDeleteContent(!deleteContent)}
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="deleteContent"
                                        checked={deleteContent}
                                        onChange={(e) => setDeleteContent(e.target.checked)}
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Label htmlFor="deleteContent" className="font-normal cursor-pointer">
                                        Xóa nội dung vi phạm
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* User Action Selection */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium mb-2 block">
                                Hành động với người vi phạm <span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={selectedUserAction}
                                onValueChange={(value: string) =>
                                    setSelectedUserAction(value as ReportActionType)
                                }
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={ReportActionType.WARN_USER} id="action-warn" />
                                    <Label htmlFor="action-warn" className="font-normal cursor-pointer">
                                        {REPORT_ACTION_LABELS[ReportActionType.WARN_USER]}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={ReportActionType.SUSPEND_USER} id="action-suspend" />
                                    <Label htmlFor="action-suspend" className="font-normal cursor-pointer">
                                        {REPORT_ACTION_LABELS[ReportActionType.SUSPEND_USER]}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={ReportActionType.BAN_USER} id="action-ban" />
                                    <Label htmlFor="action-ban" className="font-normal cursor-pointer">
                                        {REPORT_ACTION_LABELS[ReportActionType.BAN_USER]}
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Suspend Duration */}
                        {selectedUserAction === ReportActionType.SUSPEND_USER && (
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-sm font-medium mb-2 block">
                                    Thời gian tạm khóa (ngày) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={suspendDuration}
                                    onChange={(e) => setSuspendDuration(e.target.value)}
                                    placeholder="Nhập số ngày (1-365)"
                                    className={(
                                        suspendDuration &&
                                        (parseInt(suspendDuration) < 1 || parseInt(suspendDuration) > 365 || isNaN(parseInt(suspendDuration)))
                                    ) ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                                {suspendDuration && (parseInt(suspendDuration) < 1 || parseInt(suspendDuration) > 365 || isNaN(parseInt(suspendDuration))) && (
                                    <p className="text-xs text-red-600">
                                        Vui lòng nhập số ngày từ 1 đến 365
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="actionReason" className="text-sm font-medium mb-2 block">
                                Ghi chú (tùy chọn)
                            </Label>
                            <Textarea
                                id="actionReason"
                                value={actionReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setActionReason(e.target.value)
                                }
                                placeholder="Thêm ghi chú về hành động này..."
                                className="min-h-[80px] resize-none"
                            />
                        </div>

                        {/* Warning */}
                        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">
                                Hành động này không thể hoàn tác. Vui lòng xem xét kỹ trước khi
                                thực hiện.
                            </p>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowActions(false)}
                                disabled={isSubmitting}
                            >
                                Xem chi tiết
                            </Button>
                            <Button
                                onClick={handleSubmitAction}
                                disabled={
                                    isSubmitting ||
                                    (selectedUserAction === ReportActionType.SUSPEND_USER &&
                                        (!suspendDuration ||
                                            parseInt(suspendDuration) < 1 ||
                                            parseInt(suspendDuration) > 365 ||
                                            isNaN(parseInt(suspendDuration))))
                                }
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? "Đang xử lý..." : "Xác nhận xử lý"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
