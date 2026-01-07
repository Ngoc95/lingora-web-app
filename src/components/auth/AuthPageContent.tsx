"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cn } from "@/lib/utils";

export function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--neutral-50)] to-[var(--neutral-100)] flex items-center justify-center p-4 overflow-hidden">
      {/* Main Container */}
      <Link 
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-[var(--neutral-600)] hover:text-[var(--primary-500)] transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Về trang chủ
      </Link>
      <div className="relative w-full max-w-5xl h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Sliding Overlay Panel */}
        <div
          className={cn(
            "absolute top-0 z-30 h-full w-1/2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] transition-all duration-700 ease-in-out flex items-center justify-center",
            isLogin ? "left-0 rounded-r-[100px]" : "left-1/2 rounded-l-[100px]"
          )}
        >
          {/* Decorative Elements */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10" />
          
          {/* Panel Content */}
          <div className="relative z-10 text-center text-white p-8 max-w-sm">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm p-3">
              <img src="/applogo.svg" alt="Lingora" className="w-full h-full" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Lingora</h1>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              {isLogin
                ? "Đã có tài khoản? Đăng nhập ngay để tiếp tục học!"
                : "Chưa có tài khoản? Hãy đăng ký để bắt đầu hành trình học tiếng Anh!"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[var(--primary-500)] transition-all duration-300"
            >
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>
          </div>
        </div>

        {/* Forms Container */}
        <div className="flex h-full">
          {/* Login Form - Left Side */}
          <div
            className={cn(
              "w-1/2 h-full flex items-center justify-center p-8 transition-all duration-700",
              isLogin ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="w-full max-w-sm">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[var(--neutral-900)] mb-2">
                  Đăng nhập
                </h2>
                <p className="text-[var(--neutral-600)]">
                  Chào mừng bạn quay trở lại!
                </p>
              </div>
              <LoginForm />
            </div>
          </div>

          {/* Register Form - Right Side */}
          <div
            className={cn(
              "w-1/2 h-full flex items-center justify-center p-8 transition-all duration-700",
              isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="w-full max-w-sm">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[var(--neutral-900)] mb-2">
                  Đăng ký
                </h2>
                <p className="text-[var(--neutral-600)]">
                  Tạo tài khoản mới để học tiếng Anh
                </p>
              </div>
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
