"use client";

import { useState, useCallback, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { useAuth } from "@/hooks/useAuth";
import type { User, UpdateProfileRequest, ChangePasswordRequest } from "@/types/auth";
import { toast } from "sonner";

interface ProfileState {
  user: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    user: null,
    isLoading: true,
    isUpdating: false,
    error: null,
  });

  const loadProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.getMe();
      if (response.statusCode === 200 && response.metaData) {
        setState((prev) => ({
          ...prev,
          user: response.metaData,
          isLoading: false,
        }));
      } else {
        throw new Error(response.message || "Failed to load profile");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải thông tin";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<boolean> => {
      if (!state.user) return false;

      setState((prev) => ({ ...prev, isUpdating: true, error: null }));
      try {
        const response = await userService.updateProfile(state.user.id, data);
        if (response.statusCode === 200 && response.metaData) {
          setState((prev) => ({
            ...prev,
            user: response.metaData,
            isUpdating: false,
          }));
          
          // Refresh global auth state
          await useAuth.getState().refreshProfile();
          
          toast.success("Cập nhật thông tin thành công!");
          return true;
        } else {
          throw new Error(response.message || "Failed to update profile");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Cập nhật thất bại";
        setState((prev) => ({ ...prev, isUpdating: false, error: message }));
        toast.error(message);
        return false;
      }
    },
    [state.user]
  );

  const changePassword = useCallback(
    async (data: ChangePasswordRequest): Promise<boolean> => {
      if (!state.user) return false;

      setState((prev) => ({ ...prev, isUpdating: true, error: null }));
      try {
        const response = await userService.changePassword(state.user.id, data);
        if (response.statusCode === 200) {
          setState((prev) => ({ ...prev, isUpdating: false }));
          toast.success("Đổi mật khẩu thành công!");
          return true;
        } else {
          throw new Error(response.message || "Failed to change password");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Đổi mật khẩu thất bại";
        setState((prev) => ({ ...prev, isUpdating: false, error: message }));
        toast.error(message);
        return false;
      }
    },
    [state.user]
  );

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await useAuth.getState().logout();
      return true;
    } catch (error) {
      toast.error("Đăng xuất thất bại");
      return false;
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    ...state,
    loadProfile,
    updateProfile,
    changePassword,
    logout,
  };
}
