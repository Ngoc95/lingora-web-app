import { api } from "./api";
import type {
  CreateWithdrawalRequest,
  WithdrawalResponse,
  BalanceResponse,
  WithdrawalListResponse,
} from "@/types/withdrawal";

export interface WithdrawalQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
}

export const withdrawalService = {
  /**
   * Create a new withdrawal request
   * POST /withdrawals
   */
  create: (data: CreateWithdrawalRequest) =>
    api.post<WithdrawalResponse>("/withdrawals", data),

  /**
   * Get user's balance information
   * GET /withdrawals/balance
   */
  getBalance: () => api.get<BalanceResponse>("/withdrawals/balance"),

  /**
   * Get user's withdrawal history with pagination
   * GET /withdrawals/me
   */
  getMyWithdrawals: (params: WithdrawalQueryParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.sort) searchParams.append("sort", params.sort);

    const queryString = searchParams.toString();
    return api.get<WithdrawalListResponse>(
      `/withdrawals/me${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get a specific withdrawal by ID
   * GET /withdrawals/:id
   */
  getById: (id: number) => api.get<WithdrawalResponse>(`/withdrawals/${id}`),
};
