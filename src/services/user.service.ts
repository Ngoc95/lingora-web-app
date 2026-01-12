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
};
