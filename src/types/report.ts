import { User } from "./auth";
import type { ApiResponse, PaginationMeta, PaginationParams } from "./api";

// Report Type Enum - Loại vi phạm
export enum ReportType {
    SPAM = "SPAM",                      // Spam, quảng cáo
    HARASSMENT = "HARASSMENT",          // Quấy rối, bắt nạt
    HATE_SPEECH = "HATE_SPEECH",       // Ngôn từ thù ghét
    INAPPROPRIATE = "INAPPROPRIATE",    // Nội dung không phù hợp
    MISINFORMATION = "MISINFORMATION", // Thông tin sai lệch
    COPYRIGHT = "COPYRIGHT",            // Vi phạm bản quyền
    VIOLENCE = "VIOLENCE",              // Bạo lực
    ADULT_CONTENT = "ADULT_CONTENT",   // Nội dung người lớn
    OTHER = "OTHER"                     // Khác
}

// Vietnamese labels for report types
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    [ReportType.SPAM]: "Spam, quảng cáo",
    [ReportType.HARASSMENT]: "Quấy rối, bắt nạt",
    [ReportType.HATE_SPEECH]: "Ngôn từ thù ghét",
    [ReportType.INAPPROPRIATE]: "Nội dung không phù hợp",
    [ReportType.MISINFORMATION]: "Thông tin sai lệch",
    [ReportType.COPYRIGHT]: "Vi phạm bản quyền",
    [ReportType.VIOLENCE]: "Bạo lực",
    [ReportType.ADULT_CONTENT]: "Nội dung người lớn",
    [ReportType.OTHER]: "Khác"
};

// Report Status Enum
export enum ReportStatus {
    PENDING = "PENDING",     // Chờ xử lý
    ACCEPTED = "ACCEPTED",   // Đã chấp nhận
    REJECTED = "REJECTED"    // Đã từ chối
}

// Vietnamese labels for report status
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
    [ReportStatus.PENDING]: "Chờ xử lý",
    [ReportStatus.ACCEPTED]: "Đã chấp nhận",
    [ReportStatus.REJECTED]: "Đã từ chối"
};

// Report Action Type Enum
export enum ReportActionType {
    DELETE_CONTENT = "DELETE_CONTENT", // Xóa nội dung
    WARN_USER = "WARN_USER",           // Cảnh cáo người dùng
    SUSPEND_USER = "SUSPEND_USER",     // Tạm khóa tài khoản
    BAN_USER = "BAN_USER"              // Khóa vĩnh viễn
}

// Vietnamese labels for action types
export const REPORT_ACTION_LABELS: Record<ReportActionType, string> = {
    [ReportActionType.DELETE_CONTENT]: "Xóa nội dung",
    [ReportActionType.WARN_USER]: "Cảnh cáo người dùng",
    [ReportActionType.SUSPEND_USER]: "Tạm khóa tài khoản",
    [ReportActionType.BAN_USER]: "Khóa vĩnh viễn"
};

// Target Type (reuse from forum.ts)
export enum TargetType {
    POST = "POST",
    COMMENT = "COMMENT",
    STUDY_SET = "STUDY_SET"
}

// Vietnamese labels for target types
export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
    [TargetType.POST]: "Bài viết",
    [TargetType.COMMENT]: "Bình luận",
    [TargetType.STUDY_SET]: "Bộ học"
};

// Report Action Interface
export interface ReportAction {
    type: ReportActionType;
    reason?: string;
    duration?: number; // For SUSPEND_USER (days)
}

// Report Interface
export interface Report {
    id: number;
    createdBy: User;
    targetType: TargetType;
    targetId: number;
    reportType: ReportType;
    reason: string;
    status: ReportStatus;
    createdAt: string;
    targetDetails?: any; // Detailed info from getReportById
    parentContent?: any; // For comments, the parent post/studyset
    reportHistory?: any[]; // Other reports on same target
    totalReports?: number; // Total reports on same target
}

// Create Report Request
export interface CreateReportRequest {
    targetType: TargetType;
    targetId: number;
    reportType: ReportType;
    reason: string;
}

// Update Report Status Request
export interface UpdateReportStatusRequest {
    status: ReportStatus;
}

// Handle Report Request
export interface HandleReportRequest {
    status: ReportStatus;
    actions?: ReportAction[];
}

// Get All Reports Query Params
export interface GetAllReportsParams extends PaginationParams {
    sort?: string;
    status?: ReportStatus;
    targetType?: TargetType;
    reportType?: ReportType;
    createdBy?: number;
    search?: string;
}

// Get All Reports Response
export interface GetAllReportsMetaData extends PaginationMeta {
    reports: Report[];
    totalItems: number;
}

export type GetAllReportsResponse = ApiResponse<GetAllReportsMetaData>;

// Single Report Response
export type ReportResponse = ApiResponse<Report>;
