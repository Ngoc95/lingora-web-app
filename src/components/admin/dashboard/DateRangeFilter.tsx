"use client";

import { useState } from "react";
import { Calendar, X, AlertCircle } from "lucide-react";
import type { DateRangeFilter as DateRangeFilterType } from "@/types/dashboard";

interface DateRangeFilterProps {
    onFilterChange: (filter: DateRangeFilterType) => void;
    activeFilter: "today" | "week" | "14days" | "month" | "custom";
    setActiveFilter: (filter: "today" | "week" | "14days" | "month" | "custom") => void;
}

export function DateRangeFilter({ onFilterChange, activeFilter, setActiveFilter }: DateRangeFilterProps) {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [error, setError] = useState("");

    const handleFilterClick = (type: "today" | "week" | "14days" | "month") => {
        const end = new Date();
        const start = new Date();

        switch (type) {
            case "today":
                start.setHours(0, 0, 0, 0);
                break;
            case "week":
                start.setDate(start.getDate() - 7);
                break;
            case "14days":
                start.setDate(start.getDate() - 14);
                break;
            case "month":
                start.setDate(start.getDate() - 30);
                break;
        }

        const endStr = end.toISOString().split("T")[0];
        const startStr = start.toISOString().split("T")[0];

        setActiveFilter(type);
        setShowCustomPicker(false);
        setError("");
        onFilterChange({ startDate: startStr, endDate: endStr });
    };

    const handleCustomClick = () => {
        setActiveFilter("custom");
        setShowCustomPicker(true);
        setError("");
    };

    const handleApplyCustom = () => {
        setError("");

        if (!customStartDate || !customEndDate) {
            setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
            return;
        }

        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);

        if (startDate > endDate) {
            setError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            return;
        }

        // Success - apply filter
        onFilterChange({
            startDate: customStartDate,
            endDate: customEndDate
        });
        setShowCustomPicker(false);
        setError("");
    };

    const handleCancelCustom = () => {
        setShowCustomPicker(false);
        setCustomStartDate("");
        setCustomEndDate("");
        setError("");
        // Reset to previous filter or default
        if (activeFilter === "custom") {
            handleFilterClick("month");
        }
    };

    // Format date for display (dd/MM/yyyy)
    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-[var(--neutral-600)]" />
                <button
                    onClick={() => handleFilterClick("today")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "today"
                        ? "bg-[var(--primary-500)] text-white"
                        : "bg-white border border-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                        }`}
                >
                    Hôm nay
                </button>
                <button
                    onClick={() => handleFilterClick("week")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "week"
                        ? "bg-[var(--primary-500)] text-white"
                        : "bg-white border border-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                        }`}
                >
                    7 ngày
                </button>
                <button
                    onClick={() => handleFilterClick("14days")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "14days"
                        ? "bg-[var(--primary-500)] text-white"
                        : "bg-white border border-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                        }`}
                >
                    14 ngày
                </button>
                <button
                    onClick={() => handleFilterClick("month")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "month"
                        ? "bg-[var(--primary-500)] text-white"
                        : "bg-white border border-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                        }`}
                >
                    30 ngày
                </button>
                <button
                    onClick={handleCustomClick}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "custom"
                        ? "bg-[var(--primary-500)] text-white"
                        : "bg-white border border-[var(--neutral-200)] text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                        }`}
                >
                    Tùy chỉnh
                </button>
            </div>

            {/* Custom Date Picker Modal */}
            {showCustomPicker && (
                <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl border border-[var(--neutral-200)] shadow-lg z-50 min-w-[320px]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm text-[var(--neutral-900)]">
                            Chọn khoảng thời gian
                        </h3>
                        <button
                            onClick={handleCancelCustom}
                            className="text-[var(--neutral-500)] hover:text-[var(--neutral-700)] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">
                                Từ ngày
                            </label>
                            <div className="relative">
                                {/* Display box showing dd/MM/yyyy */}
                                <div
                                    className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-lg bg-white cursor-pointer hover:border-[var(--primary-500)] transition-colors flex items-center justify-between"
                                    onClick={() => document.getElementById('start-date-input')?.showPicker?.()}
                                >
                                    <span className={customStartDate ? "text-[var(--neutral-900)]" : "text-[var(--neutral-400)]"}>
                                        {customStartDate ? formatDateDisplay(customStartDate) : "dd/MM/yyyy"}
                                    </span>
                                    <Calendar className="w-4 h-4 text-[var(--neutral-400)]" />
                                </div>
                                {/* Hidden native date input */}
                                <input
                                    id="start-date-input"
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">
                                Đến ngày
                            </label>
                            <div className="relative">
                                {/* Display box showing dd/MM/yyyy */}
                                <div
                                    className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-lg bg-white cursor-pointer hover:border-[var(--primary-500)] transition-colors flex items-center justify-between"
                                    onClick={() => document.getElementById('end-date-input')?.showPicker?.()}
                                >
                                    <span className={customEndDate ? "text-[var(--neutral-900)]" : "text-[var(--neutral-400)]"}>
                                        {customEndDate ? formatDateDisplay(customEndDate) : "dd/MM/yyyy"}
                                    </span>
                                    <Calendar className="w-4 h-4 text-[var(--neutral-400)]" />
                                </div>
                                {/* Hidden native date input */}
                                <input
                                    id="end-date-input"
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="absolute inset-0 opacity-0 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-3 p-2 rounded-lg bg-[var(--error)]/10 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-[var(--error)]">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleApplyCustom}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] rounded-lg hover:bg-[var(--primary-500)]/90 transition-colors"
                        >
                            Áp dụng
                        </button>
                        <button
                            onClick={handleCancelCustom}
                            className="px-4 py-2 text-sm font-semibold text-[var(--neutral-700)] bg-[var(--neutral-100)] rounded-lg hover:bg-[var(--neutral-200)] transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
