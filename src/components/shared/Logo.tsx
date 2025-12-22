"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-2 font-bold transition-all duration-200",
        className
      )}
    >
      {/* Logo Icon */}
      <div className="relative flex shrink-0 items-center justify-center">
        <Image
          src="/applogo.svg"
          alt="Lingora Logo"
          width={50}
          height={50}
          className="rounded-lg"
          priority
        />
      </div>
      
      {/* Logo Text */}
      {!collapsed && (
        <span className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] bg-clip-text text-xl text-transparent">
          Lingora
        </span>
      )}
    </Link>
  );
}
