"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserStatus } from "@/types/auth";

export function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only check after hydration
    if (!isMounted) return;

    // Check authentication
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Prevent redirect loop if already on auth pages (though AuthGuard shouldn't be there)
        if (!pathname.startsWith("/get-started") && !pathname.startsWith("/otp")) {
           router.replace("/get-started?view=login");
        }
        return;
      }

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
  }, [user, isAuthenticated, isLoading, router, pathname, isMounted]);

  return null; // This component doesn't render anything
}
