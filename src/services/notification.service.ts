import { api } from "./api";
import {
    Notification,
    NotificationFilterOptions,
    NotificationListResponse,
    NotificationReadResponse,
    NotificationType,
} from "@/types/notification";
import { ApiResponse } from "@/types/api";
import { getIntFromObject, getNestedInt, getIntFromKeys } from "@/utils/parse-utils";

class NotificationService {
    /**
     * Get paginated notifications for the current user
     */
    async getNotifications(
        params: NotificationFilterOptions = {}
    ): Promise<NotificationListResponse> {
        const { page = 1, limit = 10 } = params;
        const response = await api.get<ApiResponse<NotificationListResponse>>(
            "/notifications",
            {
                page,
                limit,
            }
        );
        return response.metaData;
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: number): Promise<NotificationReadResponse> {
        const response = await api.patch<ApiResponse<NotificationReadResponse>>(
            `/notifications/${notificationId}`
        );
        return response.metaData;
    }

    /**
     * Build navigation URL based on notification type and data
     */
    getNavigationUrl(notification: Notification): string | null {
        const { type, data } = notification;

        if (!data) return null;

        // Extract common IDs using utility functions
        const studySetId = getIntFromKeys(data, [
            "studySetId",
            "studysetId",
            "studySetID",
            "study_set_id",
        ]) || getNestedInt(data, "studySet");

        const postId = getIntFromKeys(data, [
            "postId",
            "postID",
            "post_id",
        ]) || getNestedInt(data, "post");

        const relatedId = getIntFromKeys(data, [
            "relatedId",
            "relatedID",
            "related_id",
        ]) || getNestedInt(data, "related");

        const objectId = getIntFromObject(data, "objectId") || getIntFromObject(data, "targetId");

        const targetType = data.targetType as string | undefined;
        const targetId = getIntFromObject(data, "targetId");

        switch (type) {
            case NotificationType.LIKE:
            case NotificationType.COMMENT:
                // Check targetType to distinguish between POST, STUDY_SET, COMMENT
                switch (targetType) {
                    case "POST":
                        if (targetId) return `/forum/${targetId}`;
                        if (postId) return `/forum/${postId}`;
                        return null;

                    case "STUDY_SET":
                        if (targetId) return `/study-sets/${targetId}`;
                        const studySetIdFallback = studySetId || relatedId || objectId;
                        if (studySetIdFallback) return `/study-sets/${studySetIdFallback}`;
                        return null;

                    case "COMMENT":
                        // Navigate to parent post or study set
                        if (postId) return `/forum/${postId}`;
                        const studySetIdComment = studySetId || relatedId;
                        if (studySetIdComment) return `/study-sets/${studySetIdComment}`;
                        return null;

                    default:
                        // Fallback: prioritize postId
                        if (postId) return `/forum/${postId}`;
                        const fallbackId = studySetId || relatedId || objectId;
                        if (fallbackId) return `/study-sets/${fallbackId}`;
                        return null;
                }

            case NotificationType.ORDER:
                // ORDER only applies to study sets
                const orderId = studySetId || relatedId || objectId;
                if (orderId) return `/study-sets/${orderId}`;
                return null;

            case NotificationType.WARNING:
                switch (targetType) {
                    case "POST":
                        if (targetId) return `/forum/${targetId}`;
                        return null;
                    case "STUDY_SET":
                        if (targetId) return `/study-sets/${targetId}`;
                        return null;
                    case "COMMENT":
                        if (postId) return `/forum/${postId}`;
                        return null;
                    default:
                        return null;
                }

            case NotificationType.CHANGE_PASSWORD:
                return "/profile";

            case NotificationType.CONTENT_DELETED:
                return null; // No specific navigation for deleted content

            case NotificationType.WITHDRAWAL_PROCESSING:
            case NotificationType.WITHDRAWAL_COMPLETED:
            case NotificationType.WITHDRAWAL_REJECTED:
            case NotificationType.WITHDRAWAL_FAILED:
                const withdrawalId = getIntFromObject(data, "withdrawalId");
                if (withdrawalId) return `/withdrawals/${withdrawalId}`;
                return "/withdrawals";

            default:
                return null;
        }
    }
}

export const notificationService = new NotificationService();
