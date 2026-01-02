export enum UserRole {
  ADMIN = "ADMIN",
  LEARNER = "LEARNER",
}

export enum UserStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED",
}

export enum UserProficiency {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: UserRole }[];
  status: UserStatus;
  proficiency: UserProficiency;
  avatar: string;
  suspendedUntil: string | null;
  banReason: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  metaData: {
    user: User;
    accessToken: string;
  };
}

export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface RefreshTokenResponse {
  message: string;
  metaData: {
    accessToken: string;
  };
}
