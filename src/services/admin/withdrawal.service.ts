import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";

export interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  reason?: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface WithdrawalListResponse {
  withdrawals: WithdrawalRequest[];
  totalPages: number;
  currentPage: number;
  totalWithdrawals: number;
}

export const withdrawalService = {
  getAll: async (page = 1, limit = 10, status?: string, sort?: string, search?: string) => {
    return api.get<ApiResponse<WithdrawalListResponse>>("/withdrawals/admin/all", {
       page, limit, status, sort, search 
    });
  },

  approve: async (id: number) => {
    return api.put<ApiResponse<void>>(`/withdrawals/admin/${id}/approve`, {});
  },
  reject: async (id: number, reason: string) => {
    return api.put<ApiResponse<void>>(`/withdrawals/admin/${id}/reject`, { rejectionReason: reason });
  },

  complete: async (id: number, transactionReference: string) => {
    return api.put<ApiResponse<void>>(`/withdrawals/admin/${id}/complete`, { transactionReference });
  },

  fail: async (id: number, reason: string) => {
    return api.put<ApiResponse<void>>(`/withdrawals/admin/${id}/fail`, { reason });
  }
};
