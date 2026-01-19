"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { dashboardService } from "@/services/dashboard.service";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { TrendChart } from "@/components/admin/dashboard/TrendChart";
import { DistributionChart } from "@/components/admin/dashboard/DistributionChart";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { DateRangeFilter } from "@/components/admin/dashboard/DateRangeFilter";
import type {
  OverviewMetrics,
  UserAnalytics,
  LearningAnalytics,
  RevenueAnalytics,
  ExamAnalytics,
  RecentActivity,
  DateRangeFilter as DateRangeFilterType,
} from "@/types/dashboard";

// Helper functions
const translateProficiency = (proficiency: string): string => {
  const map: Record<string, string> = {
    BEGINNER: "Sơ cấp",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
    NOT_SET: "Chưa xác định",
  };
  return map[proficiency] || proficiency;
};

const formatChartDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, "dd/MM");
  } catch {
    return dateStr;
  }
};

const formatPercentage = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : Math.round(num);
};

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState<DateRangeFilterType>(() => {
    // Default to 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });
  const [activeFilter, setActiveFilter] = useState<"today" | "week" | "14days" | "month" | "custom">("month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [examAnalytics, setExamAnalytics] = useState<ExamAnalytics | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        overviewData,
        userAnalyticsData,
        learningAnalyticsData,
        revenueAnalyticsData,
        examAnalyticsData,
        activitiesData,
      ] = await Promise.all([
        dashboardService.getOverviewMetrics(filter),
        dashboardService.getUserAnalytics(filter),
        dashboardService.getLearningAnalytics(filter),
        dashboardService.getRevenueAnalytics(filter),
        dashboardService.getExamAnalytics(filter),
        dashboardService.getRecentActivities(20),
      ]);

      setOverview(overviewData);
      setUserAnalytics(userAnalyticsData);
      setLearningAnalytics(learningAnalyticsData);
      setRevenueAnalytics(revenueAnalyticsData);
      setExamAnalytics(examAnalyticsData);
      setActivities(activitiesData);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[var(--error)] font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p className="text-[var(--neutral-600)] text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-500)]/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data with formatted dates
  const userGrowthData = userAnalytics?.growth.map(item => ({
    ...item,
    date: formatChartDate(item.date)
  })) || [];

  const proficiencyData = userAnalytics?.byProficiency.map(item => ({
    ...item,
    proficiency: translateProficiency(item.proficiency)
  })) || [];

  const learningTrendData = learningAnalytics?.learningTrend.map(item => ({
    ...item,
    date: formatChartDate(item.date)
  })) || [];

  const examTrendData = examAnalytics?.trend.map(item => ({
    ...item,
    date: formatChartDate(item.date)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
            Trang tổng quan
          </h1>
          <p className="text-[var(--neutral-600)] mt-1">
            Tổng quan hệ thống Lingora
          </p>
        </div>
        <DateRangeFilter
          onFilterChange={setFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-[var(--neutral-100)] animate-pulse"
              />
            ))}
          </>
        ) : (
          <>
            <MetricCard
              icon={<Users className="w-8 h-8 text-[var(--primary-500)]" />}
              label="Tổng người dùng"
              value={overview?.users.total || 0}
              growth={overview?.users.growth}
              subtitle={`${overview?.users.active || 0} đang hoạt động`}
            />
            <MetricCard
              icon={<BookOpen className="w-8 h-8 text-[var(--info)]" />}
              label="Bộ học"
              value={overview?.studySets.total || 0}
              subtitle={`${overview?.studySets.published || 0} đã xuất bản`}
            />
            <MetricCard
              icon={<DollarSign className="w-8 h-8 text-[var(--success)]" />}
              label="Doanh thu"
              value={`${(overview?.revenue.total || 0).toLocaleString("vi-VN")} VNĐ`}
              growth={overview?.revenue.growth}
            />
            <MetricCard
              icon={<FileText className="w-8 h-8 text-[var(--warning)]" />}
              label="Đề thi"
              value={overview?.exams.total || 0}
              subtitle={`${overview?.exams.totalAttempts || 0} lượt làm`}
            />
          </>
        )}
      </div>

      {/* User Analytics */}
      <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--neutral-900)] mb-4">
          Phân tích người dùng
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
              Tăng trưởng người dùng
            </h3>
            <TrendChart
              data={userGrowthData}
              dataKeys={[
                { key: "count", name: "Người dùng mới", color: "#00BC7D" },
              ]}
              xAxisKey="date"
              height={250}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
              Phân bố theo trình độ
            </h3>
            <DistributionChart
              data={proficiencyData}
              dataKey="count"
              nameKey="proficiency"
              type="bar"
              height={250}
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-[var(--neutral-50)]">
            <p className="text-2xl font-bold text-[var(--primary-500)]">
              {userAnalytics?.activeUsers.daily || 0}
            </p>
            <p className="text-xs text-[var(--neutral-600)] mt-1">
              Người dùng hoạt động hôm nay
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-[var(--neutral-50)]">
            <p className="text-2xl font-bold text-[var(--primary-500)]">
              {userAnalytics?.activeUsers.weekly || 0}
            </p>
            <p className="text-xs text-[var(--neutral-600)] mt-1">
              Người dùng hoạt động tuần này
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-[var(--neutral-50)]">
            <p className="text-2xl font-bold text-[var(--primary-500)]">
              {userAnalytics?.activeUsers.monthly || 0}
            </p>
            <p className="text-xs text-[var(--neutral-600)] mt-1">
              Người dùng hoạt động tháng này
            </p>
          </div>
        </div>
      </div>

      {/* Learning Analytics */}
      <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--neutral-900)] mb-4">
          Phân tích học tập
        </h2>
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--primary-600)]/10">
            <p className="text-3xl font-bold text-[var(--primary-600)]">
              {learningAnalytics?.categories.total || 0}
            </p>
            <p className="text-sm text-[var(--neutral-700)] mt-1">Danh mục</p>
            <p className="text-xs text-[var(--neutral-600)] mt-1">
              {formatPercentage(learningAnalytics?.categories.avgProgress)}% tiến độ TB
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[var(--info)]/10 to-[var(--info)]/20">
            <p className="text-3xl font-bold text-[var(--info)]">
              {learningAnalytics?.topics.total || 0}
            </p>
            <p className="text-sm text-[var(--neutral-700)] mt-1">Chủ đề</p>
            <p className="text-xs text-[var(--neutral-600)] mt-1">
              {learningAnalytics?.topics.completedByUsers || 0} đã hoàn thành
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[var(--success)]/10 to-[var(--success)]/20">
            <p className="text-3xl font-bold text-[var(--success)]">
              {learningAnalytics?.words.total || 0}
            </p>
            <p className="text-sm text-[var(--neutral-700)] mt-1">Từ vựng</p>
            <p className="text-xs text-[var(--neutral-600)] mt-1">
              {learningAnalytics?.words.avgPerUser || 0} từ/người dùng
            </p>
          </div>
        </div>

        {/* Learning Trend */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
            Xu hướng học tập
          </h3>
          <TrendChart
            data={learningTrendData}
            dataKeys={[
              { key: "wordsLearned", name: "Từ đã học", color: "#00BC7D" },
              { key: "topicsCompleted", name: "Chủ đề hoàn thành", color: "#3B82F6" },
            ]}
            xAxisKey="date"
            height={250}
          />
        </div>

        {/* Popular Categories & Topics - Only show if data exists */}
        {(learningAnalytics?.categories.popular.length || 0) > 0 || (learningAnalytics?.topics.popular.length || 0) > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {(learningAnalytics?.categories.popular.length || 0) > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
                  Danh mục phổ biến
                </h3>
                <div className="space-y-2">
                  {learningAnalytics?.categories.popular.map((cat, index) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--neutral-50)] hover:bg-[var(--neutral-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary-500)] text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--primary-600)]">
                          {cat.usersCount} người dùng
                        </p>
                        <p className="text-xs text-[var(--neutral-600)]">
                          {formatPercentage(cat.avgProgress)}% tiến độ TB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(learningAnalytics?.topics.popular.length || 0) > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
                  Chủ đề phổ biến
                </h3>
                <div className="space-y-2">
                  {learningAnalytics?.topics.popular.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--neutral-50)] hover:bg-[var(--neutral-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--info)] text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--info)]">
                        {topic.usersCount} người dùng
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Revenue & Exam Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue */}
        <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--neutral-900)] mb-4">
            Phân tích doanh thu
          </h2>
          <TrendChart
            data={revenueAnalytics?.trend || []}
            dataKeys={[
              { key: "revenue", name: "Doanh thu (VNĐ)", color: "#10B981" },
            ]}
            xAxisKey="month"
            height={200}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[var(--success)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Thành công</p>
              <p className="text-lg font-bold text-[var(--success)]">
                {revenueAnalytics?.transactions.success || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--warning)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Đang chờ</p>
              <p className="text-lg font-bold text-[var(--warning)]">
                {revenueAnalytics?.transactions.pending || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--error)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Thất bại</p>
              <p className="text-lg font-bold text-[var(--error)]">
                {revenueAnalytics?.transactions.failed || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--info)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Tỷ lệ thành công</p>
              <p className="text-lg font-bold text-[var(--info)]">
                {formatPercentage(revenueAnalytics?.transactions.successRate)}%
              </p>
            </div>
          </div>

          {/* Top Selling - Only show if data exists */}
          {(revenueAnalytics?.topSelling.length || 0) > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
                Bộ học bán chạy
              </h3>
              <div className="space-y-2">
                {revenueAnalytics?.topSelling.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--neutral-50)] hover:bg-[var(--neutral-100)] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--success)] text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-[var(--neutral-600)]">
                          {item.ownerUsername}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold text-[var(--success)]">
                        {item.sales} lượt
                      </p>
                      <p className="text-xs text-[var(--neutral-600)]">
                        {item.revenue.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exams */}
        <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--neutral-900)] mb-4">
            Phân tích đề thi
          </h2>

          {/* Exam Overview */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[var(--primary-500)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Tổng đề thi</p>
              <p className="text-lg font-bold text-[var(--primary-600)]">
                {examAnalytics?.overview.totalExams || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--info)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Lượt làm</p>
              <p className="text-lg font-bold text-[var(--info)]">
                {examAnalytics?.overview.totalAttempts || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--success)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Đã hoàn thành</p>
              <p className="text-lg font-bold text-[var(--success)]">
                {examAnalytics?.overview.completedAttempts || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--warning)]/10">
              <p className="text-xs text-[var(--neutral-600)]">Tỷ lệ hoàn thành</p>
              <p className="text-lg font-bold text-[var(--warning)]">
                {formatPercentage(examAnalytics?.overview.completionRate)}%
              </p>
            </div>
          </div>

          {/* Performance */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[var(--neutral-50)]">
              <p className="text-xs text-[var(--neutral-600)]">Điểm trung bình</p>
              <p className="text-lg font-bold text-[var(--primary-600)]">
                {examAnalytics?.averageScore || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--neutral-50)]">
              <p className="text-xs text-[var(--neutral-600)]">Thời gian TB</p>
              <p className="text-lg font-bold text-[var(--info)]">
                {examAnalytics?.averageTimeMinutes || 0} phút
              </p>
            </div>
          </div>

          {/* Attempts Trend */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
              Xu hướng lượt làm
            </h3>
            <TrendChart
              data={examTrendData}
              dataKeys={[
                { key: "attempts", name: "Lượt làm", color: "#3B82F6" },
              ]}
              xAxisKey="date"
              height={180}
            />
          </div>

          {/* Score Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
              Phân bố điểm
            </h3>
            <DistributionChart
              data={examAnalytics?.scoreDistribution || []}
              dataKey="count"
              nameKey="range"
              type="bar"
              height={180}
            />
          </div>

          {/* Top Exam Performance - Only show if data exists */}
          {(examAnalytics?.examPerformance.length || 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--neutral-700)] mb-3">
                Hiệu suất đề thi hàng đầu
              </h3>
              <div className="space-y-2">
                {examAnalytics?.examPerformance.slice(0, 5).map((exam, index) => (
                  <div
                    key={exam.examId}
                    className="p-3 rounded-lg bg-[var(--neutral-50)] hover:bg-[var(--neutral-100)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary-500)] text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="font-medium text-sm truncate">{exam.title}</p>
                      </div>
                      <span className="text-xs text-[var(--neutral-600)] ml-2 flex-shrink-0">
                        {exam.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs ml-8">
                      <span className="text-[var(--neutral-600)]">
                        {exam.attempts} lượt làm • {exam.completed} hoàn thành
                      </span>
                      <span className="font-semibold text-[var(--primary-600)]">
                        {formatPercentage(exam.completionRate)}% hoàn thành
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--neutral-900)] mb-4">
          Hoạt động gần đây
        </h2>
        <ActivityFeed activities={activities} isLoading={isLoading} />
      </div>
    </div>
  );
}
