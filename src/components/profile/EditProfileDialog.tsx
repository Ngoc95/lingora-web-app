"use client";

import { useState, useRef, useEffect } from "react";
import { uploadService } from "@/services/upload.service";
import { Camera, User as UserIcon, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, UpdateProfileRequest } from "@/types/auth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isUpdating: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  isUpdating,
  onUpdateProfile,
}: EditProfileDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setAvatarPreview(user.avatar || null);
      setSelectedFile(null);
      setEmailError(null);
    }
  }, [open, user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Email không hợp lệ");
    } else {
      setEmailError(null);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Vui lòng chọn ảnh nhỏ hơn 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasChanges =
    username !== user?.username ||
    email !== user?.email ||
    selectedFile !== null;

  const canSave =
    hasChanges &&
    username.trim() !== "" &&
    email.trim() !== "" &&
    !emailError;

  const handleSave = async () => {
    if (!canSave) return;

    let avatarUrl: string | undefined;

    // Upload avatar if selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        const response = await uploadService.uploadImage(selectedFile);
        if (response.statusCode === 201 && response.metaData?.url) {
          avatarUrl = response.metaData.url;
        }
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        toast.error("Không thể tải ảnh lên");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const updateData: UpdateProfileRequest = {};
    if (username !== user?.username) updateData.username = username;
    if (email !== user?.email) updateData.email = email;
    if (avatarUrl) updateData.avatar = avatarUrl;

    const success = await onUpdateProfile(updateData);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Chỉnh sửa thông tin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div
              onClick={handleAvatarClick}
              className="relative w-24 h-24 cursor-pointer group"
            >
              <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                <AvatarImage
                  src={
                    avatarPreview ||
                    (user?.avatar && user.avatar !== "N/A" ? user.avatar : undefined)
                  }
                  alt={user?.username || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-3xl font-bold flex items-center justify-center">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Nhấn để thay đổi ảnh
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Tên người dùng
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="Nhập tên người dùng"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm ${
                    emailError
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
                  }`}
                  placeholder="Nhập email"
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!canSave || isUpdating || isUploading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isUpdating || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isUploading ? "Đang tải ảnh..." : "Đang lưu..."}
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
