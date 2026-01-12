export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED"
}

export enum UserRoleType {
  ADMIN = 1,
  LEARNER = 2,
  STAFF = 3 // Keeping STAFF as per some previous context, though Lingora_FE only listed 1,2.
}

export const USER_ROLES = [
  { id: UserRoleType.ADMIN, name: "ADMIN" },
  { id: UserRoleType.LEARNER, name: "USER" }, // "USER" display name for LEARNER
  { id: UserRoleType.STAFF, name: "STAFF" }
];

export enum UserSortOption {
  ID_DESC = "-id",
  ID_ASC = "+id",
  USERNAME_ASC = "+username",
  USERNAME_DESC = "-username",
  EMAIL_ASC = "+email",
  EMAIL_DESC = "-email",
  CREATED_AT_DESC = "-createdAt",
  CREATED_AT_ASC = "+createdAt"
}

export const USER_SORT_OPTIONS = [
  { label: "Mới nhất (ID)", value: UserSortOption.ID_DESC },
  { label: "Cũ nhất (ID)", value: UserSortOption.ID_ASC },
  { label: "Tên đăng nhập (A-Z)", value: UserSortOption.USERNAME_ASC },
  { label: "Tên đăng nhập (Z-A)", value: UserSortOption.USERNAME_DESC },
  { label: "Email (A-Z)", value: UserSortOption.EMAIL_ASC },
  { label: "Email (Z-A)", value: UserSortOption.EMAIL_DESC },
  { label: "Ngày tạo (Mới nhất)", value: UserSortOption.CREATED_AT_DESC },
  { label: "Ngày tạo (Cũ nhất)", value: UserSortOption.CREATED_AT_ASC },
];

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export const PROFICIENCY_LEVELS = [
  { value: ProficiencyLevel.BEGINNER, label: "Beginner (Sơ cấp)" },
  { value: ProficiencyLevel.INTERMEDIATE, label: "Intermediate (Trung cấp)" },
  { value: ProficiencyLevel.ADVANCED, label: "Advanced (Cao cấp)" }
];
