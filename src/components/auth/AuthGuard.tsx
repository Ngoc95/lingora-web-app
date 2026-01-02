"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserStatus } from "@/types/auth";

export function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only check if finished loading and authenticated
    if (!isLoading && isAuthenticated && user) {
      // If user is inactive, they should only be on auth pages or OTP page.
      // Since this guard is used in (user) layout (protected routes),
      // we must redirect inactive users to OTP.
      if (user.status === UserStatus.INACTIVE) {
         // Avoid infinite redirect if we were somehow already on OTP (though AuthGuard shouldn't be valid there)
         if (!pathname.startsWith("/otp")) {
             router.replace("/otp?email=" + encodeURIComponent(user.email));
         }
         return;
      }

      // Check if user has completed proficiency test (except Admin)
      const isAdmin = user.roles.some((role: any) => role.name === "ADMIN");
      if (user.status === UserStatus.ACTIVE && !user.proficiency && !isAdmin) {
          router.replace("/adaptive-test");
      }
    }
  }, [user, isAuthenticated, isLoading, router, pathname]);

  return null; // This component doesn't render anything
}
