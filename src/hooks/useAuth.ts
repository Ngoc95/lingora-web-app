"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import { setAuthToken, clearAuthToken } from "@/services/api";
import type { User, LoginRequest, RegisterRequest } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(data);
          const { user, accessToken } = res.metaData;
          
          setAuthToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          set({ 
            error: error.message || "Đăng nhập thất bại", 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register(data);
          const { user, accessToken } = res.metaData;
          
          setAuthToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          set({ 
            error: error.message || "Đăng ký thất bại", 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          clearAuthToken();
          set({ user: null, isAuthenticated: false, isLoading: false });
          // Optional: redirect to login handled by component or middleware
        }
      },

      refreshProfile: async () => {
        try {
          const res = await authService.getMe();
          set({ user: res.metaData, isAuthenticated: true }); // ApiResponse<User> -> metaData IS User
        } catch {
          // If checking profile fails, usually means token invalid or user deleted
          // Must call logout to clear server-side cookies (refreshToken)
          try {
            await authService.logout();
          } catch (e) {
            console.error("Force logout failed", e);
          }
          clearAuthToken();
          set({ user: null, isAuthenticated: false });
          if (typeof window !== "undefined") {
            window.location.href = "/get-started?session_expired=true";
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
