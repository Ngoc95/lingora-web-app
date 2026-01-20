import { api } from "./api";
import type {
    DateRangeFilter,
    OverviewMetrics,
    UserAnalytics,
    LearningAnalytics,
    RevenueAnalytics,
    ExamAnalytics,
    RecentActivity,
} from "@/types/dashboard";

class DashboardService {
    private baseUrl = "/admin/dashboard";

    /**
     * Get overview metrics (4 KPI cards)
     */
    async getOverviewMetrics(filter?: DateRangeFilter): Promise<OverviewMetrics> {
        const params = new URLSearchParams();
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);

        const queryString = params.toString();
        const url = `${this.baseUrl}/overview${queryString ? `?${queryString}` : ""}`;

        const response = await api.get<{ metaData: OverviewMetrics }>(url);
        return response.metaData;
    }

    /**
     * Get user analytics
     */
    async getUserAnalytics(filter?: DateRangeFilter): Promise<UserAnalytics> {
        const params = new URLSearchParams();
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);

        const queryString = params.toString();
        const url = `${this.baseUrl}/users${queryString ? `?${queryString}` : ""}`;

        const response = await api.get<{ metaData: UserAnalytics }>(url);
        return response.metaData;
    }

    /**
     * Get learning analytics
     */
    async getLearningAnalytics(filter?: DateRangeFilter): Promise<LearningAnalytics> {
        const params = new URLSearchParams();
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);

        const queryString = params.toString();
        const url = `${this.baseUrl}/learning${queryString ? `?${queryString}` : ""}`;

        const response = await api.get<{ metaData: LearningAnalytics }>(url);
        return response.metaData;
    }

    /**
     * Get revenue analytics
     */
    async getRevenueAnalytics(filter?: DateRangeFilter): Promise<RevenueAnalytics> {
        const params = new URLSearchParams();
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);

        const queryString = params.toString();
        const url = `${this.baseUrl}/revenue${queryString ? `?${queryString}` : ""}`;

        const response = await api.get<{ metaData: RevenueAnalytics }>(url);
        return response.metaData;
    }

    /**
     * Get exam analytics
     */
    async getExamAnalytics(filter?: DateRangeFilter): Promise<ExamAnalytics> {
        const params = new URLSearchParams();
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);

        const queryString = params.toString();
        const url = `${this.baseUrl}/exams${queryString ? `?${queryString}` : ""}`;

        const response = await api.get<{ metaData: ExamAnalytics }>(url);
        return response.metaData;
    }

    /**
     * Get recent activities
     */
    async getRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
        const url = `${this.baseUrl}/activities?limit=${limit}`;
        const response = await api.get<{ metaData: RecentActivity[] }>(url);
        return response.metaData;
    }
}

export const dashboardService = new DashboardService();
