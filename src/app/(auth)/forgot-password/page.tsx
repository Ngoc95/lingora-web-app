"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
      toast.success("Mã xác thực đã được gửi tới email của bạn.");
    } catch (err: any) {
      setError(
        err?.message || "Không thể gửi mã xác thực. Vui lòng kiểm tra email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CenteredCardLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email để nhận mã khôi phục mật khẩu"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[var(--neutral-900)]"
          >
            Email đã đăng ký
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--neutral-200)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none transition-all placeholder:text-[var(--neutral-400)]"
            placeholder="name@example.com"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm hover:bg-[var(--primary-500)]/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? "Đang gửi mã..." : "Gửi mã xác thực"}
        </button>
      </form>
    </CenteredCardLayout>
  );
}
