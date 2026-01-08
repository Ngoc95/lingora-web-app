"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import { setAuthToken, clearAuthToken } from "@/services/api";
import { type User, type LoginRequest, type RegisterRequest, UserRole } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      activeRole: null,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(data);
          const { user, accessToken } = res.metaData;
          
          setAuthToken(accessToken);
          // Set default active role (admin > learner or just first one)
          const defaultRole = user.roles.find(r => r.name === UserRole.ADMIN)?.name || user.roles[0]?.name || null;
          set({ user, isAuthenticated: true, activeRole: defaultRole, isLoading: false });
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
          const defaultRole = user.roles[0]?.name || null;
          set({ user, isAuthenticated: true, activeRole: defaultRole, isLoading: false });
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
          set({ user: null, isAuthenticated: false, activeRole: null, isLoading: false });
          // Optional: redirect to login handled by component or middleware
        }
      },

      refreshProfile: async () => {
        try {
          const res = await authService.getMe();
          const user = res.metaData;
          // Keep current active role if still valid, otherwise reset
          const currentRole = get().activeRole;
          const isValidRole = currentRole && user.roles.some(r => r.name === currentRole);
          const newActiveRole = isValidRole ? currentRole : (user.roles[0]?.name || null);
          
          set({ user, isAuthenticated: true, activeRole: newActiveRole }); 
        } catch {
          // If checking profile fails, usually means token invalid or user deleted
          // Must call logout to clear server-side cookies (refreshToken)
          try {
            await authService.logout();
          } catch (e) {
            console.error("Force logout failed", e);
          }
          clearAuthToken();
          set({ user: null, isAuthenticated: false, activeRole: null });
          if (typeof window !== "undefined") {
            window.location.href = "/get-started?session_expired=true";
          }
        }
      },

      clearError: () => set({ error: null }),
      
      switchRole: (role: UserRole) => set({ activeRole: role }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, activeRole: state.activeRole }),
    }
  )
);
