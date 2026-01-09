
"use client";

import { ChatSession } from "@/types/chatbot";
import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function ChatHistory({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClose,
  isLoading,
}: ChatHistoryProps) {
  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[var(--neutral-200)] flex items-center justify-between bg-white">
        <h3 className="font-semibold text-[var(--neutral-900)]">Lịch sử</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--neutral-100)] rounded-full text-[var(--neutral-500)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => {
            onNewSession();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary-500)]/10 text-[var(--primary-600)] hover:bg-[var(--primary-500)]/20 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cuộc trò chuyện mới
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {isLoading && sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--neutral-400)]">
             Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-[var(--neutral-500)] text-sm">
            Chưa có cuộc trò chuyện nào
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                onClose();
              }}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border",
                currentSessionId === session.id
                  ? "bg-[var(--primary-500)]/5 border-[var(--primary-500)]/20"
                  : "bg-white border-transparent hover:bg-[var(--neutral-50)] hover:border-[var(--neutral-200)]"
              )}
            >
              <MessageSquare
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  currentSessionId === session.id
                    ? "text-[var(--primary-500)]"
                    : "text-[var(--neutral-400)]"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    currentSessionId === session.id
                      ? "text-[var(--primary-700)]"
                      : "text-[var(--neutral-700)]"
                  )}
                >
                  {session.title || "Cuộc trò chuyện mới"}
                </p>
                <p className="text-[10px] text-[var(--neutral-400)] truncate">
                  {new Date(session.updatedAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--error)]/10 text-[var(--neutral-400)] hover:text-[var(--error)] rounded-full transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
