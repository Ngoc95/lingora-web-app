
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, History, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatBubble, ChatTypingIndicator, ChatErrorBubble } from "./ChatBubble";
import { ChatHistory } from "./ChatHistory";
import { useAuth } from "@/hooks/useAuth";
import { chatbotService } from "@/services/chatbot.service";
import { ChatMessage, ChatSender, ChatSession } from "@/types/chatbot";
import useSWR from "swr";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions using SWR
  const { data: sessionsResponse, mutate: mutateSessions, isLoading: isLoadingSessions } = useSWR(
    user ? "/chat/sessions" : null,
    chatbotService.getSessions
  );
  
  const sessions = sessionsResponse?.metaData?.sessions || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: ChatSender.USER,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatbotService.sendMessage({
        question: userMsg.content,
        sessionId: currentSessionId,
      });

      if (response.metaData) {
        setMessages(response.metaData.messages); // Update full history from server
        setCurrentSessionId(response.metaData.session.id);
        mutateSessions(); // Refresh session list
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    setShowHistory(false);
    setError(null);
    try {
        const res = await chatbotService.getSessionMessages(sessionId);
        if(res.metaData) {
            setMessages(res.metaData.messages);
            // Ensure session is set correctly incase of switching
            setCurrentSessionId(res.metaData.session.id);
        }
    } catch (err) {
        setError("Không thể tải nội dung cuộc trò chuyện");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(undefined);
    setMessages([]);
    setShowHistory(false);
    setError(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if(confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này?")) {
        try {
            await chatbotService.deleteSession(sessionId);
            mutateSessions();
            if(currentSessionId === sessionId) {
                handleNewSession();
            }
        } catch (err) {
            console.error("Error deleting session:", err);
        }
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom duration-300">
             <button 
                onClick={() => setIsMinimized(false)}
                className="bg-white p-4 rounded-2xl shadow-xl border border-[var(--primary-100)] flex items-center gap-3 hover:bg-[var(--primary-50)] transition-colors"
             >
                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="font-semibold text-[var(--primary-700)]">Lingora AI</span>
                <Maximize2 className="w-4 h-4 text-[var(--primary-400)]" />
             </button>
        </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-[var(--neutral-200)] flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--primary-500)] text-white">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <h3 className="font-bold text-lg">Lingora AI</h3>
        </div>
        <div className="flex items-center gap-1">
           <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Thu nhỏ"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onClose()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Sub Header (History toggle) */}
        {!showHistory && (
             <div className="px-4 py-2 bg-[var(--primary-50)]/50 border-b border-[var(--primary-100)] flex justify-between items-center text-xs">
                 <button 
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-1 text-[var(--primary-600)] hover:underline"
                 >
                    <History className="w-3 h-3" />
                    Lịch sử trò chuyện
                 </button>
                 {currentSessionId && (
                    <button onClick={handleNewSession} className="text-[var(--neutral-500)] hover:text-[var(--primary-500)]">
                        + Cuộc hội thoại mới
                    </button>
                 )}
            </div>
        )}


      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-[var(--neutral-50)]">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && !isLoading && !error ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
               <div className="w-16 h-16 bg-[var(--primary-100)] rounded-2xl flex items-center justify-center mb-4 text-[var(--primary-500)]">
                   <span className="text-3xl">👋</span>
               </div>
               <p className="font-semibold text-[var(--neutral-800)] mb-1">Chào bạn!</p>
               <p className="text-sm text-[var(--neutral-600)]">Tôi có thể giúp gì cho việc học của bạn hôm nay?</p>
            </div>
          ) : (
             <>
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <ChatTypingIndicator />}
                {error && <ChatErrorBubble message={error} />}
             </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[var(--neutral-200)]">
            {user ? (
                 <div className="relative">
                    <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                        }
                    }}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="w-full pl-4 pr-12 py-3 bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 focus:border-[var(--primary-500)] resize-none text-sm max-h-32"
                    rows={1}
                    style={{ minHeight: '46px' }} 
                    />
                    <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bottom-2 p-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                    <Send className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="text-center py-2 text-sm text-[var(--neutral-500)]">
                    Vui lòng <a href="/login" className="text-[var(--primary-500)] hover:underline">đăng nhập</a> để chat.
                </div>
            )}
         
        </div>

         {/* History Overlay */}
         {showHistory && (
            <ChatHistory 
                sessions={sessions}
                isLoading={isLoadingSessions}
                currentSessionId={currentSessionId}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
                onClose={() => setShowHistory(false)}
            />
         )}
      </div>
    </div>
  );
}
