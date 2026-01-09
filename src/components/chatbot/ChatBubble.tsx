
"use client";

import { cn } from "@/lib/utils";
import { ChatMessage, ChatSender } from "@/types/chatbot";
import { User, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === ChatSender.USER;
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    try {
      setFormattedTime(
        new Date(message.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (e) {
      setFormattedTime("");
    }
  }, [message.createdAt]);

  return (
    <div
      className={cn(
        "flex w-full gap-2 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser
            ? "bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white"
            : "bg-white border border-[var(--neutral-200)] text-[var(--primary-500)]"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-[var(--primary-500)] text-white rounded-tr-none"
            : "bg-white border border-[var(--neutral-200)] text-[var(--neutral-800)] rounded-tl-none"
        )}
      >
        <div className="text-sm leading-relaxed overflow-hidden prose prose-sm max-w-none break-words dark:prose-invert prose-p:my-1 prose-pre:my-1 prose-pre:bg-black/10 prose-pre:p-2 prose-pre:rounded-lg">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{children}</a>,
                ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                li: ({children}) => <li className="mb-0.5">{children}</li>,
                code: ({children, className}) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                        <code className={cn("bg-black/10 rounded px-1 py-0.5", className)}>{children}</code>
                    ) : (
                        <code className="bg-black/10 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
                    )
                }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div
          className={cn(
            "text-[10px] mt-1 text-right",
            isUser ? "text-white/80" : "text-[var(--neutral-500)]"
          )}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}

export function ChatTypingIndicator() {
  return (
    <div className="flex w-full gap-2 mb-4 flex-row">
      <div className="w-8 h-8 rounded-full bg-white border border-[var(--neutral-200)] flex items-center justify-center text-[var(--primary-500)] flex-shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="bg-white border border-[var(--neutral-200)] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[var(--primary-500)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-[var(--primary-500)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-[var(--primary-500)] rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}

export function ChatErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex w-full gap-2 mb-4 flex-row justify-center">
      <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg px-3 py-2 flex items-center gap-2 max-w-[90%]">
        <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0" />
        <span className="text-xs text-[var(--error)]">{message}</span>
      </div>
    </div>
  );
}
