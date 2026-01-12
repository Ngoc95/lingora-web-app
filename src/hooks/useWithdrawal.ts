"use client";

import { useState, useCallback, useEffect } from "react";
import { withdrawalService } from "@/services/withdrawal.service";
import type {
  Withdrawal,
  Balance,
  WithdrawalStatus,
  CreateWithdrawalRequest,
} from "@/types/withdrawal";
import { toast } from "sonner";

interface WithdrawalState {
  withdrawals: Withdrawal[];
  balance: Balance | null;
  selectedWithdrawal: Withdrawal | null;
  currentPage: number;
  totalPages: number;
  total: number;
  selectedStatus: WithdrawalStatus | null;
  isLoadingWithdrawals: boolean;
  isLoadingBalance: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  error: string | null;
}

export function useWithdrawal() {
  const [state, setState] = useState<WithdrawalState>({
    withdrawals: [],
    balance: null,
    selectedWithdrawal: null,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedStatus: null,
    isLoadingWithdrawals: false,
    isLoadingBalance: false,
    isLoadingDetail: false,
    isCreating: false,
    error: null,
  });

  const loadBalance = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingBalance: true }));
    try {
      const response = await withdrawalService.getBalance();
      if (response.statusCode === 200 && response.metaData) {
        setState((prev) => ({
          ...prev,
          balance: response.metaData,
          isLoadingBalance: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoadingBalance: false }));
    }
  }, []);

  const loadWithdrawals = useCallback(
    async (page: number = 1, status?: WithdrawalStatus | null) => {
      setState((prev) => ({ ...prev, isLoadingWithdrawals: true }));
      try {
        const response = await withdrawalService.getMyWithdrawals({
          page,
          limit: 10,
          status: status || undefined,
          sort: "-createdAt",
        });
        if (response.statusCode === 200 && response.metaData) {
          setState((prev) => ({
            ...prev,
            withdrawals: response.metaData.withdrawals,
            currentPage: response.metaData.currentPage,
            totalPages: response.metaData.totalPages,
            total: response.metaData.total,
            isLoadingWithdrawals: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({ ...prev, isLoadingWithdrawals: false }));
      }
    },
    []
  );

  const loadWithdrawalDetail = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoadingDetail: true }));
    try {
      const response = await withdrawalService.getById(id);
      if (response.statusCode === 200 && response.metaData) {
        setState((prev) => ({
          ...prev,
          selectedWithdrawal: response.metaData,
          isLoadingDetail: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoadingDetail: false }));
      toast.error("Không thể tải thông tin rút tiền");
    }
  }, []);

  const createWithdrawal = useCallback(
    async (data: CreateWithdrawalRequest): Promise<boolean> => {
      setState((prev) => ({ ...prev, isCreating: true, error: null }));
      try {
        const response = await withdrawalService.create(data);
        if (response.statusCode === 201 && response.metaData) {
          setState((prev) => ({ ...prev, isCreating: false }));
          toast.success("Tạo yêu cầu rút tiền thành công!");
          // Reload balance and list
          loadBalance();
          loadWithdrawals(1, state.selectedStatus);
          return true;
        } else {
          throw new Error(response.message || "Failed to create withdrawal");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Tạo yêu cầu thất bại";
        setState((prev) => ({ ...prev, isCreating: false, error: message }));
        toast.error(message);
        return false;
      }
    },
    [loadBalance, loadWithdrawals, state.selectedStatus]
  );

  const filterByStatus = useCallback(
    (status: WithdrawalStatus | null) => {
      setState((prev) => ({ ...prev, selectedStatus: status }));
      loadWithdrawals(1, status);
    },
    [loadWithdrawals]
  );

  const clearSelectedWithdrawal = useCallback(() => {
    setState((prev) => ({ ...prev, selectedWithdrawal: null }));
  }, []);

  const refresh = useCallback(() => {
    loadBalance();
    loadWithdrawals(state.currentPage, state.selectedStatus);
  }, [loadBalance, loadWithdrawals, state.currentPage, state.selectedStatus]);

  // Initial load
  useEffect(() => {
    loadBalance();
    loadWithdrawals(1, null);
  }, [loadBalance, loadWithdrawals]);

  return {
    ...state,
    loadBalance,
    loadWithdrawals,
    loadWithdrawalDetail,
    createWithdrawal,
    filterByStatus,
    clearSelectedWithdrawal,
    refresh,
  };
}
