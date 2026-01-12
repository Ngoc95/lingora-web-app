"use client";

import { useState } from "react";
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
import {
    ReportType,
    REPORT_TYPE_LABELS,
    TargetType,
    TARGET_TYPE_LABELS,
} from "@/types/report";
import { reportService } from "@/services/report.service";
import { toast } from "sonner";
import { AlertCircle, Flag } from "lucide-react";

interface ReportDialogProps {
    targetType: TargetType;
    targetId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ReportDialog({
    targetType,
    targetId,
    open,
    onOpenChange,
    onSuccess,
}: ReportDialogProps) {
    const [reportType, setReportType] = useState<ReportType>(ReportType.SPAM);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (reportType === ReportType.OTHER && !reason.trim()) {
            toast.error("Vui lòng nhập lý do báo cáo khi chọn 'Khác'");
            return;
        }

        if (reason.length > 500) {
            toast.error("Lý do báo cáo không được vượt quá 500 ký tự");
            return;
        }

        setIsSubmitting(true);

        try {
            await reportService.createReport({
                targetType,
                targetId,
                reportType,
                reason: reason.trim() || REPORT_TYPE_LABELS[reportType],
            });

            toast.success("Báo cáo của bạn đã được gửi thành công");

            // Reset form
            setReportType(ReportType.SPAM);
            setReason("");

            // Close dialog
            onOpenChange(false);

            // Call success callback
            onSuccess?.();
        } catch (error: any) {
            console.error("Failed to create report:", error);
            toast.error(
                error?.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setReportType(ReportType.SPAM);
        setReason("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Flag className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Báo cáo vi phạm</DialogTitle>
                            <DialogDescription>
                                {TARGET_TYPE_LABELS[targetType]} #{targetId}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Report Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium mb-2 block">
                            Loại vi phạm <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                            value={reportType}
                            onValueChange={(value: string) => setReportType(value as ReportType)}
                            className="space-y-2"
                        >
                            {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <RadioGroupItem value={key} id={key} />
                                    <Label
                                        htmlFor={key}
                                        className="font-normal cursor-pointer"
                                    >
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Reason Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium mb-2 block">
                            Lý do chi tiết
                            {reportType === ReportType.OTHER && (
                                <span className="text-red-500"> *</span>
                            )}
                            <span className="text-neutral-500 font-normal ml-1">
                                {reportType === ReportType.OTHER ? "(bắt buộc)" : "(tùy chọn)"}
                            </span>
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            placeholder={
                                reportType === ReportType.OTHER
                                    ? "Vui lòng mô tả chi tiết lý do báo cáo..."
                                    : "Thêm thông tin chi tiết (không bắt buộc)..."
                            }
                            className="min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-neutral-500 text-right">
                            {reason.length}/500 ký tự
                        </p>
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
