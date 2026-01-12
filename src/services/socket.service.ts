import { io, Socket } from "socket.io-client";
import { Notification } from "@/types/notification";

type NotificationCallback = (notification: Notification) => void;

class SocketService {
    private socket: Socket | null = null;
    private listeners: NotificationCallback[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    /**
     * Connect to the notification socket
     */
    connect(token: string, baseUrl: string, userId?: number) {
        if (this.socket?.connected) {
            console.log("Socket already connected");
            return;
        }

        // Parse base URL to get socket URL
        const socketUrl = baseUrl.replace(/^http/, "ws").replace(/\/api.*$/, "");

        this.socket = io(socketUrl, {
            auth: {
                token,
            },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on("connect", () => {
            console.log("Socket connected");
            this.reconnectAttempts = 0;

            // Join user's notification room if userId is provided
            if (userId) {
                this.socket?.emit("join", `user_${userId}`);
            }
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error("Max reconnection attempts reached");
                this.disconnect();
            }
        });

        // Listen for new notifications
        this.socket.on("notification", (notification: Notification) => {
            console.log("New notification received:", notification);
            this.listeners.forEach((callback) => callback(notification));
        });

        // Listen for notification updates (e.g., marked as read)
        this.socket.on("notification:update", (notification: Notification) => {
            console.log("Notification updated:", notification);
            // Could handle updates differently if needed
        });
    }

    /**
     * Disconnect from the socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners = [];
            this.reconnectAttempts = 0;
        }
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Subscribe to new notifications
     */
    onNotification(callback: NotificationCallback) {
        this.listeners.push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
        };
    }

    /**
     * Emit an event to the socket
     */
    emit(event: string, data?: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn("Socket not connected, cannot emit event:", event);
        }
    }
}

// Export singleton instance
export const socketService = new SocketService();
