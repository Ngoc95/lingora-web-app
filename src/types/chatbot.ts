
import type { ApiResponse } from "./api";
import type { User } from "./auth";

export enum ChatSender {
  USER = "USER",
  AI = "AI",
}

export interface ChatSession {
  id: string;
  title: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: ChatSender;
  createdAt: string;
}

export interface ChatSessionDetail {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface ChatSendRequest {
  question: string;
  sessionId?: string;
}

export interface ChatSendResponseData {
  session: ChatSession;
  answer: string;
  messages: ChatMessage[];
}

export type ChatSendResponse = ApiResponse<ChatSendResponseData>;

export interface ChatSessionsResponseData {
  sessions: ChatSession[];
}

export type ChatSessionsResponse = ApiResponse<ChatSessionsResponseData>;

export interface ChatSessionMessagesResponseData {
  session: ChatSession;
  messages: ChatMessage[];
}

export type ChatSessionMessagesResponse = ApiResponse<ChatSessionMessagesResponseData>;

export interface ChatDeleteSessionResponseData {
  sessionId: string;
}

export type ChatDeleteSessionResponse = ApiResponse<ChatDeleteSessionResponseData>;
