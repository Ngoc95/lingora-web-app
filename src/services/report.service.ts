import { api } from "./api";
import type {
    CreateReportRequest,
    GetAllReportsParams,
    GetAllReportsResponse,
    HandleReportRequest,
    Report,
    ReportResponse,
    ReportStatus,
    UpdateReportStatusRequest,
} from "@/types/report";

export const reportService = {
    /**
     * Create a new report (Student)
     */
    createReport: async (data: CreateReportRequest) => {
        return api.post<ReportResponse>("/reports", data);
    },

    /**
     * Get all reports with filters (Admin only)
     */
    getAllReports: async (params?: GetAllReportsParams) => {
        const queryParams: Record<string, string | number | boolean | null | undefined> = {};

        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.sort) queryParams.sort = params.sort;
        if (params?.status) queryParams.status = params.status;
        if (params?.targetType) queryParams.targetType = params.targetType;
        if (params?.reportType) queryParams.reportType = params.reportType;
        if (params?.createdBy) queryParams.createdBy = params.createdBy;
        if (params?.search) queryParams.search = params.search;

        return api.get<GetAllReportsResponse>("/reports", queryParams);
    },

    /**
     * Get report by ID (Admin only)
     */
    getReportById: async (id: number) => {
        return api.get<ReportResponse>(`/reports/${id}`);
    },

    /**
     * Update report status only (Admin only)
     */
    updateReportStatus: async (id: number, status: ReportStatus) => {
        const data: UpdateReportStatusRequest = { status };
        return api.patch<ReportResponse>(`/reports/${id}/status`, data);
    },

    /**
     * Handle report with actions (Admin only)
     */
    handleReport: async (id: number, data: HandleReportRequest) => {
        return api.patch<ReportResponse>(`/reports/${id}/handle`, data);
    },

    /**
     * Delete report (Admin only)
     */
    deleteReport: async (id: number) => {
        return api.delete<ReportResponse>(`/reports/${id}`);
    },
};
