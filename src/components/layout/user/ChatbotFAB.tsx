"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Chào bạn! Tôi là Lingora AI, trợ lý học tập của bạn. Hãy hỏi tôi bất cứ điều gì về việc học tiếng Anh nhé!",
  timestamp: new Date().toISOString(),
};

export function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Call chatbot API
    setTimeout(() => {
      const botMessage: Message = {
        role: "assistant",
        content: "Đây là câu trả lời mẫu. API chatbot sẽ được tích hợp sau!",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Chatbot Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:inset-auto md:bottom-24 md:right-6 md:h-[600px] md:w-[400px]">
          {/* Mobile backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat window */}
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl bg-white shadow-2xl md:relative md:h-full md:rounded-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--neutral-200)] p-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)]">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--neutral-900)]">Lingora AI</h3>
                  <p className="text-xs text-[var(--neutral-600)]">Trợ lý học tập</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-[var(--neutral-600)] hover:text-[var(--neutral-900)]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white"
                        : "bg-[var(--neutral-100)] text-[var(--neutral-900)]"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.role === "user" ? "text-white/70" : "text-[var(--neutral-600)]"
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--neutral-100)] rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-[var(--neutral-200)] p-4 shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]",
          "hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] hover:scale-110 hover:shadow-xl",
          "bottom-6 right-4 md:right-6"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}
