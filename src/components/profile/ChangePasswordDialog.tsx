"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, ChangePasswordRequest } from "@/types/auth";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isUpdating: boolean;
  onChangePassword: (data: ChangePasswordRequest) => Promise<boolean>;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  user,
  isUpdating,
  onChangePassword,
}: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (user?.hasPassword && !oldPassword) {
      newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onChangePassword({
      oldPassword: user?.hasPassword ? oldPassword : undefined,
      newPassword,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const canSubmit =
    (!user?.hasPassword || oldPassword) &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {user?.hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Old Password */}
          {user?.hasPassword && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, oldPassword: undefined }));
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm ${
                    errors.oldPassword
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showOldPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.oldPassword}
                </p>
              )}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-neutral-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm ${
                  errors.newPassword
                    ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                    : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                }`}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            ) : (
              <p className="text-neutral-500 text-xs mt-1">
                Tối thiểu 6 ký tự
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-neutral-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }}
                className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                    : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                }`}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isUpdating}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Lưu mật khẩu"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
