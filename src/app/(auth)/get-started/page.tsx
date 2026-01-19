import { Suspense } from "react";
import { AuthPageContent } from "@/components/auth/AuthPageContent";
import { GoogleOAuthProvider } from "@/components/auth/GoogleOAuthProvider";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <GoogleOAuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <AuthPageContent />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
