import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[var(--neutral-50)] to-[var(--neutral-100)]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--primary-600)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-[var(--primary-600)]/10 to-[var(--primary-500)]/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[var(--neutral-200)] bg-white/80 p-8 shadow-xl backdrop-blur-sm">
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-[var(--neutral-600)]">
          © {new Date().getFullYear()} Lingora. All rights reserved.
        </p>
      </div>
    </div>
  );
}
