"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { GoogleLogin } from "@react-oauth/google";

export function RegisterForm() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

      const isAdmin = user.roles.some((role: any) => role.name === "ADMIN");

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
        disabled={isLoading || isGoogleLoading}
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

      <div className="w-full">
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
