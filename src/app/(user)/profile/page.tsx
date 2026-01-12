"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import {
  User,
  Mail,
  Calendar,
  GraduationCap,
  ChevronRight,
  Lock,
  LogOut,
  Edit,
  Wallet,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { UserProficiency } from "@/types/auth";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const proficiencyOptions = [
  {
    value: UserProficiency.BEGINNER,
    label: "Người mới bắt đầu",
    description: "Bạn mới bắt đầu học ngôn ngữ",
  },
  {
    value: UserProficiency.INTERMEDIATE,
    label: "Trung cấp",
    description: "Bạn đã có kiến thức cơ bản",
  },
  {
    value: UserProficiency.ADVANCED,
    label: "Nâng cao",
    description: "Bạn đã thành thạo và muốn nâng cao kỹ năng",
  },
];

const getProficiencyLabel = (proficiency: UserProficiency) => {
  return (
    proficiencyOptions.find((p) => p.value === proficiency)?.label || proficiency
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isUpdating, updateProfile, changePassword, logout } = useProfile();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProficiencyDialog, setShowProficiencyDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [selectedProficiency, setSelectedProficiency] =
    useState<UserProficiency | null>(null);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push("/login");
    }
  };

  const handleUpdateProficiency = async () => {
    if (!selectedProficiency || selectedProficiency === user?.proficiency)
      return;
    const success = await updateProfile({ proficiency: selectedProficiency });
    if (success) {
      setShowProficiencyDialog(false);
      setSelectedProficiency(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header with Gradient */}
      <div className="bg-gradient-primary text-black px-4 py-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={
                    user?.avatar && user.avatar !== "N/A"
                      ? user.avatar
                      : undefined
                  }
                  alt={user?.username || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-white text-primary text-3xl font-bold flex items-center justify-center h-full w-full">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.username || "User"}</h1>
              <p className="text-black/80">{user?.email}</p>
              {/* Status Badge */}
              <div
                className={`mt-2 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1.5 ${
                  user?.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : user?.status === "INACTIVE"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user?.status === "ACTIVE"
                      ? "bg-green-600"
                      : user?.status === "INACTIVE"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                />
                {user?.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 space-y-4">
        {/* Streak Card */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <div>
              <div className="text-2xl font-bold">
                {user?.currentStreak || 0} ngày liên tiếp
              </div>
              <div className="text-white/80 text-sm">
                Kỷ lục: {user?.longestStreak || 0} ngày
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            Thông tin cá nhân
          </h2>
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-neutral-500">Tên người dùng</div>
                <div className="font-semibold text-neutral-900">
                  {user?.username}
                </div>
              </div>
            </div>
            <div className="h-px bg-neutral-100" />

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-neutral-500">Email</div>
                <div className="font-semibold text-neutral-900">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="h-px bg-neutral-100" />

            {/* Proficiency with Edit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Trình độ</div>
                  <div className="font-semibold text-neutral-900">
                    {user?.proficiency
                      ? getProficiencyLabel(user.proficiency)
                      : "Chưa xác định"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProficiency(user?.proficiency || null);
                  setShowProficiencyDialog(true);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-primary" />
              </button>
            </div>
            <div className="h-px bg-neutral-100" />

            {/* Join Date */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-neutral-500">Ngày tham gia</div>
                <div className="font-semibold text-neutral-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Card */}
        {user?.roles && user.roles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Vai trò</h2>
            <div className="space-y-2">
              {user.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 bg-primary/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium text-neutral-900">
                      {role.name === "ADMIN"
                        ? "Quản trị viên"
                        : role.name === "LEARNER"
                        ? "Người học"
                        : role.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 divide-y divide-neutral-100">
          <button
            onClick={() => setShowEditProfileDialog(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-neutral-900">
                Chỉnh sửa thông tin
              </div>
              <div className="text-sm text-neutral-500">
                Cập nhật tên, email và ảnh đại diện
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>

          <button
            onClick={() => setShowChangePasswordDialog(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-neutral-900">
                {user?.hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
              </div>
              <div className="text-sm text-neutral-500">
                {user?.hasPassword
                  ? "Thay đổi mật khẩu đăng nhập"
                  : "Thiết lập mật khẩu đăng nhập"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>

          <button
            onClick={() => router.push("/profile/withdrawals")}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-neutral-900">Rút tiền</div>
              <div className="text-sm text-neutral-500">
                Quản lý thu nhập và rút tiền
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full bg-red-50 border border-red-200 text-red-600 py-4 rounded-2xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={showEditProfileDialog}
        onOpenChange={setShowEditProfileDialog}
        user={user}
        isUpdating={isUpdating}
        onUpdateProfile={updateProfile}
      />
      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
        user={user}
        isUpdating={isUpdating}
        onChangePassword={(data) => {
          // Wrap changePassword because standard function returns existing interface
          // and ChangePasswordDialog expects a certain signature.
          // Actually they match signatures in my refactor if useProfile works.
          // Let's verify type compatibility.
          // useProfile changePassword: (data: ChangePasswordRequest) => Promise<boolean>
          // ChangePasswordDialog prop: (data: ChangePasswordRequest) => Promise<boolean>
          // Perfect.
          return changePassword ? changePassword(data) : Promise.resolve(false);
        }}
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <LogOut className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-bold">Xác nhận đăng xuất</h3>
            </div>
            <p className="text-neutral-600 mb-6">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proficiency Selection Dialog */}
      {showProficiencyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Chọn trình độ</h3>
              <button
                onClick={() => {
                  setShowProficiencyDialog(false);
                  setSelectedProficiency(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {proficiencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedProficiency(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProficiency === option.value
                      ? "border-primary bg-primary/5"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={`font-semibold ${
                          selectedProficiency === option.value
                            ? "text-primary"
                            : "text-neutral-900"
                        }`}
                      >
                        {option.label}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {option.description}
                      </div>
                    </div>
                    {selectedProficiency === option.value && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowProficiencyDialog(false);
                  setSelectedProficiency(null);
                }}
                className="flex-1 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateProficiency}
                disabled={
                  !selectedProficiency ||
                  selectedProficiency === user?.proficiency ||
                  isUpdating
                }
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
