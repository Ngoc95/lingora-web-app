"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWithdrawal } from "@/hooks/useWithdrawal";
import {
  WithdrawalStatus,
  WithdrawalStatusDisplay,
} from "@/types/withdrawal";
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  CreditCard,
  User,
  MapPin,
  Hash,
  Calendar,
  FileText,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";

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

const getStatusIcon = (status: WithdrawalStatus) => {
  switch (status) {
    case WithdrawalStatus.PENDING:
      return Clock;
    case WithdrawalStatus.PROCESSING:
      return RefreshCw;
    case WithdrawalStatus.COMPLETED:
      return CheckCircle;
    case WithdrawalStatus.REJECTED:
      return XCircle;
    case WithdrawalStatus.FAILED:
      return AlertCircle;
  }
};

const getStatusColors = (status: WithdrawalStatus) => {
  switch (status) {
    case WithdrawalStatus.PENDING:
      return { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100" };
    case WithdrawalStatus.PROCESSING:
      return { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" };
    case WithdrawalStatus.COMPLETED:
      return { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" };
    case WithdrawalStatus.REJECTED:
    case WithdrawalStatus.FAILED:
      return { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" };
  }
};

export default function WithdrawalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const {
    selectedWithdrawal: withdrawal,
    isLoadingDetail,
    loadWithdrawalDetail,
    clearSelectedWithdrawal,
  } = useWithdrawal();

  useEffect(() => {
    if (id) {
      loadWithdrawalDetail(id);
    }
    return () => {
      clearSelectedWithdrawal();
    };
  }, [id, loadWithdrawalDetail, clearSelectedWithdrawal]);

  if (isLoadingDetail || !withdrawal) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const StatusIcon = getStatusIcon(withdrawal.status);
  const statusColors = getStatusColors(withdrawal.status);

  // Timeline steps
  const timelineSteps = [
    { status: "PENDING", label: "Chờ xử lý" },
    { status: "PROCESSING", label: "Đang xử lý" },
    { status: "COMPLETED", label: "Hoàn thành" },
  ];

  const getCurrentStepIndex = () => {
    switch (withdrawal.status) {
      case WithdrawalStatus.PENDING:
        return 0;
      case WithdrawalStatus.PROCESSING:
        return 1;
      case WithdrawalStatus.COMPLETED:
        return 2;
      default:
        return -1; // For REJECTED/FAILED
    }
  };

  const currentIndex = getCurrentStepIndex();
  const isRejectedOrFailed =
    withdrawal.status === WithdrawalStatus.REJECTED ||
    withdrawal.status === WithdrawalStatus.FAILED;

  return (
    <div className="min-h-screen bg-neutral-100/50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Chi tiết rút tiền</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Status Card */}
        <div className={`${statusColors.bg} rounded-2xl p-6 text-center`}>
          <div
            className={`w-14 h-14 ${statusColors.iconBg} rounded-full mx-auto mb-3 flex items-center justify-center`}
          >
            <StatusIcon className={`w-7 h-7 ${statusColors.text}`} />
          </div>
          <div className={`text-xl font-bold ${statusColors.text} mb-2`}>
            {WithdrawalStatusDisplay[withdrawal.status]}
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {formatCurrency(withdrawal.amount)}
          </div>
        </div>

        {/* Bank Information */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <h2 className="font-bold text-neutral-900 mb-4">Thông tin ngân hàng</h2>
          <div className="space-y-4">
            <InfoRow
              icon={Building2}
              label="Ngân hàng"
              value={withdrawal.bankName}
            />
            <InfoRow
              icon={CreditCard}
              label="Số tài khoản"
              value={withdrawal.bankAccountNumber}
            />
            <InfoRow
              icon={User}
              label="Chủ tài khoản"
              value={withdrawal.bankAccountName}
            />
            {withdrawal.bankBranch && (
              <InfoRow
                icon={MapPin}
                label="Chi nhánh"
                value={withdrawal.bankBranch}
              />
            )}
          </div>
        </div>

        {/* Transaction Information */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <h2 className="font-bold text-neutral-900 mb-4">Thông tin giao dịch</h2>
          <div className="space-y-4">
            <InfoRow
              icon={Hash}
              label="Mã yêu cầu"
              value={`#${withdrawal.id}`}
            />
            <InfoRow
              icon={Calendar}
              label="Ngày tạo"
              value={formatDate(withdrawal.createdAt)}
            />
            <InfoRow
              icon={RefreshCw}
              label="Cập nhật lần cuối"
              value={formatDate(withdrawal.updatedAt)}
            />
            {withdrawal.transactionReference && (
              <InfoRow
                icon={FileText}
                label="Mã giao dịch NH"
                value={withdrawal.transactionReference}
              />
            )}
          </div>
        </div>

        {/* Rejection Reason */}
        {isRejectedOrFailed && withdrawal.rejectionReason && (
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-700 mb-1">
                  {withdrawal.status === WithdrawalStatus.REJECTED
                    ? "Lý do từ chối"
                    : "Lý do thất bại"}
                </div>
                <div className="text-red-600">{withdrawal.rejectionReason}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <h2 className="font-bold text-neutral-900 mb-4">Trạng thái xử lý</h2>

          {isRejectedOrFailed ? (
            <div className="flex items-center justify-center gap-2 py-4 text-red-600">
              <XCircle className="w-6 h-6" />
              <span className="font-medium">
                {withdrawal.status === WithdrawalStatus.REJECTED
                  ? "Yêu cầu đã bị từ chối"
                  : "Giao dịch thất bại"}
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              {timelineSteps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? isCurrent
                            ? "bg-primary"
                            : "bg-green-500"
                          : "bg-neutral-200"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm font-bold text-neutral-500">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isCurrent
                          ? "font-bold text-neutral-900"
                          : isCompleted
                          ? "text-neutral-700"
                          : "text-neutral-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-neutral-400" />
      <div>
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="font-medium text-neutral-900">{value}</div>
      </div>
    </div>
  );
}
