"use client";

import { useEffect, useState } from "react";
import { reportService } from "@/services/report.service";
import {
  Report,
  ReportStatus,
  TargetType,
  ReportType,
  REPORT_STATUS_LABELS,
  TARGET_TYPE_LABELS,
  REPORT_TYPE_LABELS,
} from "@/types/report";
import { toast } from "sonner";
import { Eye, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportDetailDialog } from "./_components/ReportDetailDialog";
import { formatTimeAgo } from "@/utils/date";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetType | "ALL">("ALL");
  const [reportTypeFilter, setReportTypeFilter] = useState<ReportType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openInActionMode, setOpenInActionMode] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        sort: "-createdAt",
      };

      if (statusFilter !== "ALL") params.status = statusFilter;
      if (targetTypeFilter !== "ALL") params.targetType = targetTypeFilter;
      if (reportTypeFilter !== "ALL") params.reportType = reportTypeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await reportService.getAllReports(params);

      setReports(response.metaData.reports || []);
      setTotalPages(response.metaData.totalPages || 1);
      setTotalItems(response.metaData.totalItems || 0);
    } catch (error: any) {
      console.error("Failed to fetch reports:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter, targetTypeFilter, reportTypeFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchReports();
  };

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setTargetTypeFilter("ALL");
    setReportTypeFilter("ALL");
    setSearchQuery("");
    setPage(1);
  };

  const handleViewReport = (report: Report, actionMode: boolean = false) => {
    setSelectedReport(report);
    setOpenInActionMode(actionMode);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchReports(); // Refresh the list
    setOpenInActionMode(false);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return "bg-yellow-100 text-yellow-700";
      case ReportStatus.ACCEPTED:
        return "bg-green-100 text-green-700";
      case ReportStatus.REJECTED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getTargetTypeColor = (type: TargetType) => {
    switch (type) {
      case TargetType.POST:
        return "bg-blue-100 text-blue-700";
      case TargetType.COMMENT:
        return "bg-purple-100 text-purple-700";
      case TargetType.STUDY_SET:
        return "bg-green-100 text-green-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Quản lý báo cáo vi phạm
        </h1>
        <p className="text-neutral-600 mt-1">
          Xem xét và xử lý các báo cáo từ người dùng
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-neutral-600" />
          <h2 className="font-semibold text-neutral-900">Bộ lọc</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Trạng thái
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ReportStatus | "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {Object.entries(REPORT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Type Filter */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Loại nội dung
            </label>
            <Select
              value={targetTypeFilter}
              onValueChange={(value) => setTargetTypeFilter(value as TargetType | "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {Object.entries(TARGET_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Type Filter */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Loại vi phạm
            </label>
            <Select
              value={reportTypeFilter}
              onValueChange={(value) => setReportTypeFilter(value as ReportType | "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Tìm kiếm
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm theo lý do..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={handleClearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4">
          <p className="text-sm text-neutral-600">Tổng số báo cáo</p>
          <p className="text-2xl font-bold text-neutral-900">{totalItems}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-yellow-700">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-900">
            {reports.filter((r) => r.status === ReportStatus.PENDING).length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
          <p className="text-sm text-green-700">Đã chấp nhận</p>
          <p className="text-2xl font-bold text-green-900">
            {reports.filter((r) => r.status === ReportStatus.ACCEPTED).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4">
          <p className="text-sm text-red-700">Đã từ chối</p>
          <p className="text-2xl font-bold text-red-900">
            {reports.filter((r) => r.status === ReportStatus.REJECTED).length}
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">
            Đang tải...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">
            Không có báo cáo nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100/50 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Loại nội dung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Loại vi phạm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Người báo cáo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Lý do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-neutral-100/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        #{report.id}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTargetTypeColor(
                            report.targetType
                          )}`}
                        >
                          {TARGET_TYPE_LABELS[report.targetType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {REPORT_TYPE_LABELS[report.reportType]}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {report.createdBy.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">
                        {report.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {REPORT_STATUS_LABELS[report.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          {report.status === ReportStatus.PENDING && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={async () => {
                                  if (confirm("Bạn có chắc muốn từ chối báo cáo này?")) {
                                    try {
                                      await reportService.updateReportStatus(
                                        report.id,
                                        ReportStatus.REJECTED
                                      );
                                      toast.success("Đã từ chối báo cáo");
                                      fetchReports();
                                    } catch (error: any) {
                                      console.error("Failed to reject report:", error);
                                      const errorMessage = error?.response?.data?.message || error?.message || "Không thể từ chối báo cáo";
                                      toast.error(errorMessage);
                                    }
                                  }
                                }}
                              >
                                Từ chối
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleViewReport(report, true)}
                              >
                                Xử lý
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
                <p className="text-sm text-neutral-600">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        report={selectedReport}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        openInActionMode={openInActionMode}
      />
    </div>
  );
}
