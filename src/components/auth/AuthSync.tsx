"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { setAuthToken } from "@/services/api";
import { toast } from "sonner";

/**
 * AuthSync Component
 * Listens for 'syncToken' in URL and synchronizes authentication from Extension
 */
export default function AuthSync() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshProfile, isAuthenticated } = useAuth();

    useEffect(() => {
        const syncToken = searchParams.get("syncToken");

        if (syncToken) {
            const performSync = async () => {
                try {
                    console.log("Lingora: Synchronizing session from extension...");

                    // 1. Set the token in localStorage
                    await setAuthToken(syncToken);

                    // 2. Refresh profile to populate user state
                    await refreshProfile();

                    toast.success("Đã đồng bộ phiên đăng nhập từ Extension!");

                    // 3. Clean up URL
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.delete("syncToken");
                    const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
                    router.replace(newUrl);

                } catch (error) {
                    console.error("Auth sync failed:", error);
                    toast.error("Không thể đồng bộ phiên đăng nhập.");
                }
            };

            performSync();
        }
    }, [searchParams, refreshProfile, router]);

    return null; // This component doesn't render anything
}
