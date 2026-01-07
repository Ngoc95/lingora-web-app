"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login({ identifier, password });

      if (user.status === "INACTIVE") {
        try {
          await authService.requestEmailVerification();
        } catch (otpError) {
          console.warn("Failed to trigger OTP email on login:", otpError);
        }
        router.push("/otp?email=" + encodeURIComponent(user.email));
        return;
      }
      
      const isAdmin = user.roles.some((role: any) => role.name === "ADMIN");
      
      if (isAdmin) {
          toast.success("Đăng nhập thành công! Chào mừng trở lại, Admin.");
          router.push("/admin/dashboard");
      } else {
          toast.success("Đăng nhập thành công! Chào mừng bạn.");
          router.push("/vocabulary");
      }
    } catch (err: any) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Identifier */}
        <div className="space-y-2">
          <label 
            htmlFor="login-identifier" 
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Tên đăng nhập hoặc Email
          </label>
          <input
            id="login-identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)]"
            placeholder="Nhập tên đăng nhập hoặc email"
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="login-password" 
              className="text-sm font-medium text-[var(--neutral-900)]"
            >
              Mật khẩu
            </label>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)] pr-12"
              placeholder="Nhập mật khẩu"
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
          <Link
            href="/forgot-password"
            className="absolute top-0 right-0 text-sm font-medium text-[var(--primary-500)] hover:text-[var(--primary-600)]"
            tabIndex={2}
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm shadow-[var(--primary-500)]/25 hover:bg-[var(--primary-500)]/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--neutral-200)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-[var(--neutral-600)]">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl border border-[var(--neutral-200)] bg-white text-[var(--neutral-900)] font-semibold hover:bg-[var(--neutral-50)] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
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
