import { api } from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  User,
} from "@/types/auth";
import type { ApiResponse, MessageResponse } from "@/types/api";

export const authService = {
  /**
   * Login
   * POST /auth/login
   */
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data),

  /**
   * Register
   * POST /auth/register
   */
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),

  /**
   * Google OAuth Login
   * POST /auth/google
   */
  googleLogin: (idToken: string) =>
    api.post<AuthResponse>("/auth/google", { idToken }),

  /**
   * Logout
   * POST /auth/logout
   */
  logout: () => api.post<MessageResponse>("/auth/logout"),

  /**
   * Refresh Token
   * POST /auth/refresh-token
   */
  refreshToken: () =>
    api.post<RefreshTokenResponse>("/auth/refresh-token"),

  /**
   * Get Current User
   * GET /auth/me
   */
  getMe: () =>
    api.get<ApiResponse<User>>("/auth/me", undefined, {
      cache: "no-store",
      headers: { Pragma: "no-cache" },
    }),

  /**
   * Request Email Verification OTP
   * POST /auth/email-verification/request
   */
  requestEmailVerification: () =>
    api.post<MessageResponse>("/auth/email-verification/request"),

  /**
   * Verify Email OTP
   * POST /auth/email-verification/verify
   */
  verifyEmail: (data: VerifyEmailRequest) =>
    api.post<ApiResponse<User>>("/auth/email-verification/verify", data),

  /**
   * Request Password Reset Code
   * POST /auth/password-reset/request
   */
  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<MessageResponse>("/auth/password-reset/request", data),

  /**
   * Verify Password Reset Code
   * POST /auth/password-reset/verify
   */
  verifyResetCode: (data: VerifyResetCodeRequest) =>
    api.post<ApiResponse<{ resetToken: string }>>(
      `/auth/password-reset/verify?code=${data.code}`,
      { email: data.email }
    ),

  /**
   * Reset Password
   * POST /auth/password-reset/confirm
   * Note: This requires the temporary resetToken in Authorization header, handled by caller or interceptor
   */
  resetPassword: (data: ResetPasswordRequest, resetToken: string) =>
    apiClient<MessageResponse>("/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${resetToken}`,
      },
    }),
};

// Import apiClient to use in resetPassword for custom header
import { apiClient } from "./api";
