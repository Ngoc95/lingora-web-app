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

                    // If token is invalid, notify extension to logout
                    if (error instanceof Error && (error.message.includes('401') || error.message.includes('expired') || error.message.includes('invalid'))) {
                        console.log("Lingora: Invalid token from extension, notifying extension to logout");

                        // Notify extension to clear its auth
                        if ((window as any).chrome && (window as any).chrome.runtime) {
                            try {
                                (window as any).chrome.runtime.sendMessage({
                                    action: 'syncAuth',
                                    accessToken: null
                                });
                            } catch (e) {
                                console.warn("Could not notify extension:", e);
                            }
                        }

                        toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
                    } else {
                        toast.error("Không thể đồng bộ phiên đăng nhập.");
                    }

                    // Clean up URL even on error
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.delete("syncToken");
                    const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
                    router.replace(newUrl);
                }
            };

            performSync();
        }
    }, [searchParams, refreshProfile, router]);

    return null; // This component doesn't render anything
}
