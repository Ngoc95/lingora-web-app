"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { OTPInput } from "@/components/auth/OTPInput";
import { authService } from "@/services/auth.service";

function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.verifyResetCode({ email, code: otp });
      const resetToken = res.metaData.resetToken;
      toast.success("Xác thực mã thành công! Vui lòng đặt mật khẩu mới.");
      router.push(`/forgot-password/reset?token=${resetToken}`);
    } catch (err: any) {
      setError(err?.message || "Mã xác thực không hợp lệ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);

    try {
      await authService.forgotPassword({ email });
      setCanResend(false);
      setCountdown(60);
      setOtp("");
      toast.success("Mã xác thực mới đã được gửi tới email của bạn.");
    } catch (err: any) {
      setError(err?.message || "Gửi lại mã thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center bg-[var(--neutral-50)] p-4 rounded-xl border border-[var(--neutral-200)]">
        <p className="text-sm text-[var(--neutral-600)] mb-1">
          Mã xác thực đã được gửi tới
        </p>
        <p className="font-semibold text-[var(--neutral-900)]">
          {email || "email của bạn"}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

      <button
        type="submit"
        disabled={isLoading || otp.length !== 6}
        className="w-full py-3.5 rounded-xl bg-[var(--primary-500)] text-white font-semibold shadow-sm hover:bg-[var(--primary-500)]/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? "Đang xác thực..." : "Xác thực"}
      </button>

      <div className="text-center text-sm text-[var(--neutral-600)]">
        <p>
          Bạn chưa nhận được mã?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className={`font-semibold transition-colors ${
              canResend
                ? "text-[var(--primary-500)] hover:text-[var(--primary-600)] hover:underline"
                : "text-[var(--neutral-400)] cursor-not-allowed"
            }`}
          >
            {canResend ? "Gửi lại" : `Gửi lại sau ${countdown}s`}
          </button>
        </p>
      </div>
    </form>
  );
}

export default function VerifyResetCodePage() {
  return (
    <CenteredCardLayout
      title="Nhập mã xác thực"
      subtitle="Mã dùng một lần để đặt lại mật khẩu của bạn"
      backLinkHref="/forgot-password"
      backLinkText="Quay lại"
    >
      <Suspense
        fallback={
          <div className="h-60 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <VerifyResetCodeForm />
      </Suspense>
    </CenteredCardLayout>
  );
}
