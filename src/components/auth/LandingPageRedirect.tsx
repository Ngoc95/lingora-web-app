"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export function LandingPageRedirect() {
  const router = useRouter();
  const { isAuthenticated, user, activeRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (activeRole === UserRole.ADMIN) {
        router.push("/admin/dashboard");
      } else {
        router.push("/vocabulary");
      }
    }
  }, [isAuthenticated, user, router, activeRole]);

  return null;
}
