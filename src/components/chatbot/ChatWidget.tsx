
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide chatbot during exam practice sessions
  const isExamMode = pathname?.includes("/practice/tests/") && pathname?.includes("/sections/");
  
  if (isExamMode) {
    return null;
  }

  return (
    <>
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {!isOpen && (
        <button
            onClick={() => setIsOpen(true)}
            className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110",
            "bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white",
            "hover:shadow-[0_0_20px_rgba(var(--primary-500-rgb),0.5)]"
            )}
        >
            <MessageCircle className="w-7 h-7" />
        </button>
      )}
    </>
  );
}
