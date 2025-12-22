"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call register API
      // await authApi.register({ username, email, password });
      
      // Redirect to OTP page
      router.push(`/otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
          Đăng ký
        </h1>
        <p className="text-sm text-[var(--neutral-600)]">
          Tạo tài khoản mới để bắt đầu học tiếng Anh
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-[var(--neutral-900)]">
            Tên người dùng
          </label>
          <input
            id="username"
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Nhập tên người dùng"
            className="w-full rounded-lg border border-[var(--neutral-200)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-[var(--neutral-900)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
            className="w-full rounded-lg border border-[var(--neutral-200)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-[var(--neutral-900)]">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--neutral-200)] bg-white px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-600)] hover:text-[var(--neutral-900)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--neutral-900)]">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--neutral-200)] bg-white px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-600)] hover:text-[var(--neutral-900)] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] py-3 text-sm font-semibold text-white transition-all hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--neutral-200)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-[var(--neutral-600)]">Hoặc</span>
        </div>
      </div>

      {/* Google Sign In */}
      <button className="w-full rounded-lg border border-[var(--neutral-200)] bg-white py-3 text-sm font-medium text-[var(--neutral-900)] transition-all hover:bg-[var(--neutral-50)] flex items-center justify-center gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Đăng ký với Google
      </button>

      <p className="text-center text-sm text-[var(--neutral-600)]">
        Đã có tài khoản?{" "}
        <a href="/login" className="font-medium text-[var(--primary-500)] hover:underline">
          Đăng nhập ngay
        </a>
      </p>
    </div>
  );
}


