import type { ApiResponse } from "./api";

export enum WithdrawalStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  FAILED = "FAILED",
}

export const WithdrawalStatusDisplay: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.PENDING]: "Chờ xử lý",
  [WithdrawalStatus.PROCESSING]: "Đang xử lý",
  [WithdrawalStatus.COMPLETED]: "Hoàn thành",
  [WithdrawalStatus.REJECTED]: "Từ chối",
  [WithdrawalStatus.FAILED]: "Thất bại",
};

export interface Withdrawal {
  id: number;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankBranch?: string | null;
  status: WithdrawalStatus;
  rejectionReason?: string | null;
  transactionReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  totalEarnings: number;
  pendingWithdrawal: number;
  withdrawnAmount: number;
  availableBalance: number;
}

export interface WithdrawalListMetadata {
  withdrawals: Withdrawal[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface CreateWithdrawalRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankBranch?: string;
}

export type WithdrawalResponse = ApiResponse<Withdrawal>;
export type BalanceResponse = ApiResponse<Balance>;
export type WithdrawalListResponse = ApiResponse<WithdrawalListMetadata>;

// Common Vietnamese banks
export const vietnameseBanks = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "MB Bank",
  "VPBank",
  "ACB",
  "Sacombank",
  "TPBank",
  "HDBank",
  "OCB",
  "SHB",
  "VIB",
  "MSB",
  "SeABank",
  "Eximbank",
  "LienVietPostBank",
  "Nam A Bank",
  "Bac A Bank",
];
