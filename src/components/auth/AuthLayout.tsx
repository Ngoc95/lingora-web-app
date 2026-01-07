import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackHome?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackHome = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Branding & Decoration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--primary-500)] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/auth-pattern.svg')] opacity-10" />
        <div className="relative z-10 text-center text-white p-12">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">Lingora</h1>
          <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
            Học tiếng Anh hiệu quả qua phương pháp lặp lại ngắt quãng và gamification.
          </p>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 lg:p-24 justify-center bg-white relative">
        {showBackHome && (
          <Link
            href="/"
            className="absolute top-6 left-6 sm:top-12 sm:left-12 inline-flex items-center gap-2 text-[var(--neutral-600)] hover:text-[var(--primary-500)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
        )}

        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-[var(--neutral-900)] mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[var(--neutral-600)]">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
