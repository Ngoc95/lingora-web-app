"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { GoogleLogin } from "@react-oauth/google";

export function LoginForm() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

      const { activeRole } = useAuth.getState();
      const isAdmin = activeRole === "ADMIN"; 

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        throw new Error("Không nhận được token từ Google");
      }

      const user = await googleLogin(idToken);

      if (user.status === "INACTIVE") {
        try {
          await authService.requestEmailVerification();
        } catch (otpError) {
          console.warn("Failed to trigger OTP email on Google login:", otpError);
        }
        router.push("/otp?email=" + encodeURIComponent(user.email));
        return;
      }

      const { activeRole } = useAuth.getState();
      const isAdmin = activeRole === "ADMIN";

      if (isAdmin) {
        toast.success("Đăng nhập Google thành công! Chào mừng trở lại, Admin.");
        router.push("/admin/dashboard");
      } else {
        toast.success("Đăng nhập Google thành công! Chào mừng bạn.");
        router.push("/vocabulary");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
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
            className="text-sm font-medium text-[var(--neutral-900)] mb-2 block"
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
        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Mật khẩu
          </label>
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
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[var(--primary-500)] hover:text-[var(--primary-600)] hover:underline"
              tabIndex={2}
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isGoogleLoading}
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

      <div className="w-full google-login-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="continue_with"
          shape="rectangular"
          size="large"
          width="100%"
          logo_alignment="left"
        />
      </div>
    </form>
  );
}
