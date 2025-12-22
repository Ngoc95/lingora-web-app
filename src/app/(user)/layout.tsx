import { UserTopBar } from "@/components/layout/user/UserTopBar";
import { ChatbotFAB } from "@/components/layout/user/ChatbotFAB";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--neutral-50)]">
      {/* Top Bar with Navigation */}
      <UserTopBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4 md:py-6 lg:px-6">
        {children}
      </main>

      {/* Chatbot FAB */}
      <ChatbotFAB />
    </div>
  );
}
