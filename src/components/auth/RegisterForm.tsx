"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setIsLoading(true);

    try {
      await register({ username, email, password });
      // Explicitly request OTP as requested by user
      try {
        await authService.requestEmailVerification();
      } catch (otpError) {
        console.warn("Failed to trigger initial OTP email:", otpError);
        // Continue flow anyway, user can resend on OTP page
      }
      toast.success("Đăng ký thành công! Vui lòng xác thực email.");
      router.push("/otp?email=" + encodeURIComponent(email));
    } catch (err: any) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Username */}
        <div className="space-y-1">
          <label
            htmlFor="register-username"
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Tên đăng nhập
          </label>
          <input
            id="register-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)] text-sm"
            placeholder="Ví dụ: nguyenvanA"
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="register-email"
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)] text-sm"
            placeholder="name@example.com"
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            htmlFor="register-password"
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)] pr-12 text-sm"
              placeholder="Tối thiểu 6 ký tự"
              disabled={isLoading}
              minLength={6}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="register-confirmPassword"
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              id="register-confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)] pr-12 text-sm"
              placeholder="Nhập lại mật khẩu"
              disabled={isLoading}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm hover:bg-[var(--primary-500)]/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--neutral-200)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-[var(--neutral-600)]">
            Hoặc đăng ký với
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl border border-[var(--neutral-200)] bg-white text-[var(--neutral-900)] font-semibold hover:bg-[var(--neutral-50)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 text-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            className="text-[#4285F4]"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            className="text-[#34A853]"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            className="text-[#FBBC05]"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            className="text-[#EA4335]"
          />
        </svg>
        Google
      </button>
    </form>
  );
}
