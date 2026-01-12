import { api } from "./api";
import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export const userService = {
  /**
   * Update user profile
   * PATCH /users/:id
   */
  updateProfile: (userId: number, data: UpdateProfileRequest) =>
    api.patch<ApiResponse<User>>(`/users/${userId}`, data),

  /**
   * Change password
   * PATCH /users/:id
   */
  changePassword: (userId: number, data: ChangePasswordRequest) =>
    api.patch<ApiResponse<User>>(`/users/${userId}`, data),

  // === Admin endpoints ===
  admin: {
    getAll: async (
      page: number = 1, 
      limit: number = 20, 
      search?: string, 
      proficiency?: string,
      status?: string,
      sort?: string
    ) => {
      // Build params object
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (proficiency) params.proficiency = proficiency;
      if (status) params.status = status;
      if (sort) params.sort = sort;

      return api.get<ApiResponse<{
          currentPage: number;
          totalPages: number;
          total: number;
          users: any[];
        }>>("/users", params);
    },

    getUserById: async (id: number) => {
      return api.get<ApiResponse<any>>(`/users/${id}`);
    },
    
    createUser: async (data: any) => {
      return api.post<ApiResponse<any>>("/users", data);
    },

    updateUser: async (id: number, data: any) => {
        return api.patch<ApiResponse<any>>(`/users/${id}`, data);
    },

    // Lingora_FE has: PATCH /users/restore/{id}
    restore: async (id: number) => {
        return api.patch<ApiResponse<any>>(`/users/restore/${id}`, {});
    },

    delete: async (id: number) => {
      return api.delete<ApiResponse<any>>(`/users/${id}`);
    },

    // Map the new generic update to "ban/suspend" logic if backend supports specific fields
    // Lingora_FE UserManagementDto.kt UpdateUserRequest: status, banReason, suspendedUntil
    ban: async (id: number, reason: string) => {
      return api.patch<ApiResponse<any>>(`/users/${id}`, { 
        status: "BANNED",
        banReason: reason 
      });
    },

    suspend: async (id: number, reason: string, until: string) => {
      return api.patch<ApiResponse<any>>(`/users/${id}`, { 
        status: "SUSPENDED",
        banReason: reason,
        suspendedUntil: until
      });
    },

    unlock: async (id: number) => {
      return api.patch<ApiResponse<any>>(`/users/${id}`, { 
        status: "ACTIVE",
        banReason: null,
        suspendedUntil: null
      });
    },
  },
};
