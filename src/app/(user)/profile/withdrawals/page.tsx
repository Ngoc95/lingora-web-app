"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWithdrawal } from "@/hooks/useWithdrawal";
import {
  WithdrawalStatus,
  WithdrawalStatusDisplay,
} from "@/types/withdrawal";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { CreateWithdrawalDialog } from "@/components/withdrawal/CreateWithdrawalDialog";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: WithdrawalStatus) => {
  switch (status) {
    case WithdrawalStatus.PENDING:
      return "bg-orange-100 text-orange-700";
    case WithdrawalStatus.PROCESSING:
      return "bg-blue-100 text-blue-700";
    case WithdrawalStatus.COMPLETED:
      return "bg-green-100 text-green-700";
    case WithdrawalStatus.REJECTED:
    case WithdrawalStatus.FAILED:
      return "bg-red-100 text-red-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
};

const statusFilters = [
  { value: null, label: "Tất cả" },
  { value: WithdrawalStatus.PENDING, label: "Chờ xử lý" },
  { value: WithdrawalStatus.PROCESSING, label: "Đang xử lý" },
  { value: WithdrawalStatus.COMPLETED, label: "Hoàn thành" },
  { value: WithdrawalStatus.REJECTED, label: "Từ chối" },
  { value: WithdrawalStatus.FAILED, label: "Thất bại" },
];

export default function WithdrawalsPage() {
  const router = useRouter();
  const {
    withdrawals,
    balance,
    currentPage,
    totalPages,
    total,
    selectedStatus,
    isLoadingWithdrawals,
    isLoadingBalance,
    isCreating,
    loadWithdrawals,
    loadBalance,
    createWithdrawal,
    filterByStatus,
  } = useWithdrawal();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Rút tiền</h1>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo yêu cầu</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-white shadow-lg">
          {isLoadingBalance ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/80 text-sm">Số dư khả dụng</span>
                <button
                  onClick={loadBalance}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="text-3xl font-bold mb-4">
                {formatCurrency(balance?.availableBalance || 0)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-white/70 text-xs">Tổng thu nhập</div>
                  <div className="font-semibold text-sm">
                    {formatCurrency(balance?.totalEarnings || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 text-xs">Đang chờ xử lý</div>
                  <div className="font-semibold text-sm">
                    {formatCurrency(balance?.pendingWithdrawal || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 text-xs">Đã rút</div>
                  <div className="font-semibold text-sm">
                    {formatCurrency(balance?.withdrawnAmount || 0)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.value || "all"}
              onClick={() => filterByStatus(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === filter.value
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* History Title */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-neutral-900">Lịch sử rút tiền</h2>
          <span className="text-sm text-neutral-500">{total} yêu cầu</span>
        </div>

        {/* Loading State */}
        {isLoadingWithdrawals && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoadingWithdrawals && withdrawals.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Wallet className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <div className="text-neutral-600 font-medium mb-1">
              Chưa có yêu cầu rút tiền nào
            </div>
            <div className="text-neutral-400 text-sm">
              Nhấn nút "Tạo yêu cầu" để bắt đầu
            </div>
          </div>
        )}

        {/* Withdrawal List */}
        {!isLoadingWithdrawals && withdrawals.length > 0 && (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <button
                key={withdrawal.id}
                onClick={() =>
                  router.push(`/profile/withdrawals/${withdrawal.id}`)
                }
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex items-center justify-between hover:shadow-md transition-shadow text-left"
              >
                <div>
                  <div className="font-bold text-neutral-900">
                    {formatCurrency(withdrawal.amount)}
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {withdrawal.bankName} - {withdrawal.bankAccountNumber}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {formatDate(withdrawal.createdAt)}
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                    withdrawal.status
                  )}`}
                >
                  {WithdrawalStatusDisplay[withdrawal.status]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => loadWithdrawals(currentPage - 1, selectedStatus)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => loadWithdrawals(currentPage + 1, selectedStatus)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <CreateWithdrawalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        balance={balance}
        isLoadingBalance={isLoadingBalance}
        isCreating={isCreating}
        onCreateWithdrawal={createWithdrawal}
      />
    </div>
  );
}
