"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call verify OTP API
      // await authApi.verifyOtp({ email, otp: otpCode });
      
      // Redirect to adaptive test
      router.push("/adaptive-test");
    } catch (err) {
      setError("Mã OTP không hợp lệ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      // TODO: Call resend OTP API
      // await authApi.resendOtp({ email });
      
      setCanResend(false);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Gửi lại OTP thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-[var(--neutral-900)]">
          Xác thực OTP
        </h1>
        <p className="text-sm text-[var(--neutral-600)]">
          Chúng tôi đã gửi mã 6 chữ số đến
        </p>
        <p className="font-semibold text-[var(--neutral-900)]">{email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-[var(--neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] py-3 text-sm font-semibold text-white transition-all hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-sm text-[var(--neutral-600)]">
          Không nhận được mã?{" "}
          {canResend ? (
            <button
              onClick={handleResend}
              className="font-medium text-[var(--primary-500)] hover:underline"
            >
              Gửi lại
            </button>
          ) : (
            <span className="font-semibold text-[var(--neutral-900)]">
              Gửi lại sau {countdown}s
            </span>
          )}
        </p>
      </div>

      {/* Back to Login */}
      <p className="text-center text-sm text-[var(--neutral-600)]">
        <a href="/login" className="font-medium text-[var(--primary-500)] hover:underline">
          ← Quay lại đăng nhập
        </a>
      </p>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-500)] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-[var(--neutral-600)] mt-4">Đang tải...</p>
        </div>
      </div>
    }>
      <OTPContent />
    </Suspense>
  );
}

