"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseCountdownOptions {
  onExpire?: () => void;
  autoStart?: boolean;
}

interface UseCountdownReturn {
  timeLeft: number;
  formattedTime: string;
  isExpired: boolean;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function useCountdown(
  initialSeconds: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const { onExpire, autoStart = false } = options;
  
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire ref updated
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onExpireRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const start = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setTimeLeft(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isExpired: timeLeft === 0,
    isRunning,
    start,
    pause,
    reset,
  };
}
