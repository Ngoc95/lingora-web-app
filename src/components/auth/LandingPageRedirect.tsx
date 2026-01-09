"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export function LandingPageRedirect() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.roles.some((role) => role.name === UserRole.ADMIN);
      if (isAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/vocabulary");
      }
    }
  }, [isAuthenticated, user, router]);

  return null;
}
