"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { Logo } from "../shared/Logo";

export function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const { isAuthenticated, user, activeRole } = useAuth();
  
  // Default to Register if no param (user clicked "Get Started"), 
  // or Login if view=login (user clicked "Login" or Logged out)
  const [isLogin, setIsLogin] = useState(viewParam === "login");

  useEffect(() => {
    if (viewParam === "login") {
      setIsLogin(true);
    } else if (viewParam === "register") {
      setIsLogin(false);
    }
  }, [viewParam]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleToUse = activeRole ?? user.roles[0]?.name ?? null;
      if (!roleToUse) return;
      router.push(roleToUse === UserRole.ADMIN ? "/admin/dashboard" : "/vocabulary");
    }
  }, [isAuthenticated, user, activeRole, router]);

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
      <div className="relative w-full max-w-5xl min-h-[550px] md:h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:block">
        
        {/* Mobile Header (Logo) - Visible only on mobile */}
        <div className="md:hidden pt-8 pb-4 flex flex-col items-center">
            <Logo className="pt-10"/>
        </div>

        {/* Sliding Overlay Panel - Hidden on Mobile */}
        <div
          className={cn(
            "hidden md:flex absolute top-0 z-30 h-full w-1/2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] transition-all duration-700 ease-in-out items-center justify-center",
            isLogin ? "left-1/2 rounded-l-[100px]" : "left-0 rounded-r-[100px]"
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
                ? "Chưa có tài khoản? Hãy đăng ký để bắt đầu hành trình học tiếng Anh!"
                : "Đã có tài khoản? Đăng nhập ngay để tiếp tục học!"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[var(--primary-500)] transition-all duration-300"
            >
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </button>
          </div>
        </div>

        {/* Forms Container */}
        <div className="flex-1 flex flex-col md:flex-row h-full relative">
          {/* Login Form - Left Side */}
          {/* Mobile: Show if isLogin. Desktop: Always render but control opacity */}
          <div
            className={cn(
              "w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-700",
              // Desktop: positioning
              "md:absolute md:top-0 md:left-0",
              // Visibility Logic
              isLogin 
                ? "flex opacity-100 z-20"  // Active state
                : "hidden md:flex md:opacity-0 md:pointer-events-none md:z-10" // Inactive state
            )}
          >
            <div className="w-full max-w-sm">
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--neutral-900)] mb-2">
                  Đăng nhập
                </h2>
                <p className="text-[var(--neutral-600)]">
                  Chào mừng bạn quay trở lại!
                </p>
              </div>
              <LoginForm />
              
              {/* Mobile Toggle Link */}
              <div className="mt-8 text-center md:hidden">
                <p className="text-neutral-600 text-sm">
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-[var(--primary-600)] font-semibold hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Register Form - Right Side */}
          <div
            className={cn(
              "w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-700",
               // Desktop: positioning
              "md:absolute md:top-0 md:right-0",
              // Visibility Logic
              !isLogin 
                ? "flex opacity-100 z-20" 
                : "hidden md:flex md:opacity-0 md:pointer-events-none md:z-10"
            )}
          >
            <div className="w-full max-w-sm">
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--neutral-900)] mb-2">
                  Đăng ký
                </h2>
                <p className="text-[var(--neutral-600)]">
                  Tạo tài khoản mới để học tiếng Anh
                </p>
              </div>
              <RegisterForm />

               {/* Mobile Toggle Link */}
               <div className="mt-8 text-center md:hidden">
                <p className="text-neutral-600 text-sm">
                  Đã có tài khoản?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-[var(--primary-600)] font-semibold hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
