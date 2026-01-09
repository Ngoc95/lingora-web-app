
import { api } from "./api";
import type {
  ChatSendRequest,
  ChatSendResponse,
  ChatSessionsResponse,
  ChatSessionMessagesResponse,
  ChatDeleteSessionResponse,
} from "@/types/chatbot";

export const chatbotService = {
  /**
   * Send a message to the chatbot
   * POST /chat
   */
  sendMessage: (data: ChatSendRequest) =>
    api.post<ChatSendResponse>("/chat", data),

  /**
   * Get all chat sessions
   * GET /chat/sessions
   */
  getSessions: () =>
    api.get<ChatSessionsResponse>("/chat/sessions"),

  /**
   * Get messages for a specific session
   * GET /chat/sessions/{sessionId}/messages
   */
  getSessionMessages: (sessionId: string) =>
    api.get<ChatSessionMessagesResponse>(`/chat/sessions/${sessionId}/messages`),

  /**
   * Delete a chat session
   * DELETE /chat/sessions/{sessionId}
   */
  deleteSession: (sessionId: string) =>
    api.delete<ChatDeleteSessionResponse>(`/chat/sessions/${sessionId}`),
};
