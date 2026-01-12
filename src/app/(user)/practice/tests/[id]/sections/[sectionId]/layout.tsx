import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Exam Section Layout
 * This layout overrides the parent (user) layout to provide
 * a clean, immersive exam-taking experience without:
 * - App navigation bar (UserTopBar)
 * - Chatbot FAB (ChatWidget)
 */
export default function ExamSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AuthGuard />
      {children}
    </div>
  );
}
