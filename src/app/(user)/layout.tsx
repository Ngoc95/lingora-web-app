import { UserTopBar } from "@/components/layout/user/UserTopBar";
import { ChatWidget } from "@/components/chatbot/ChatWidget";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--neutral-50)]">
      {/* Top Bar with Navigation */}
      <AuthGuard />
      <UserTopBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4 md:py-6 lg:px-6">
        {children}
      </main>

      {/* Chatbot FAB */}
      <ChatWidget />
    </div>
  );
}
