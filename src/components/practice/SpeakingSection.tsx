"use client";

/**
 * Speaking Section Layout
 * Prompt display with actual recording interface using MediaRecorder API
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Check } from "lucide-react";
import { ExamSectionGroup } from "@/types/exam";

interface SpeakingSectionProps {
  group: ExamSectionGroup;
  answers: { [questionId: number]: unknown };
  onAnswer: (questionId: number, value: unknown) => void;
}

export function SpeakingSection({
  group,
  answers,
  onAnswer,
}: SpeakingSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const question = group.questionGroups?.[0]?.questions[0];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking permission
      setHasPermission(true);
      setPermissionError(null);
      return true;
    } catch (err) {
      setHasPermission(false);
      setPermissionError("Không thể truy cập microphone. Vui lòng cấp quyền trong cài đặt trình duyệt.");
      return false;
    }
  };

  const startRecording = async () => {
    if (hasPermission === null) {
      const granted = await requestPermission();
      if (!granted) return;
    } else if (!hasPermission) {
      setPermissionError("Vui lòng cấp quyền microphone để ghi âm.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Store as base64 or blob URL for submission
        if (question) {
          onAnswer(question.id, url);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      setPermissionError("Không thể bắt đầu ghi âm. Vui lòng thử lại.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const reRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  if (!question) {
    return (
      <div className="text-center text-neutral-500 py-8">
        Không có câu hỏi cho phần này
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Task Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div 
            className="w-8 h-8 text-white rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
          >
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-orange-700">
            {group.title || "Speaking Task"}
          </h3>
        </div>

        {group.description && (
          <p className="text-orange-700 mb-4">{group.description}</p>
        )}

        {/* Prompt */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          {group.content && (
            <div
              className="prose prose-neutral max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: group.content }}
            />
          )}
          {question.prompt && (
            <p className="font-medium text-neutral-800 text-lg">
              {question.prompt}
            </p>
          )}
        </div>
      </div>

      {/* Recording Interface */}
      <div className={`rounded-xl shadow-sm border p-8 text-center ${
        isRecording 
          ? "bg-red-50 border-red-200" 
          : audioUrl 
            ? "bg-green-50 border-green-200" 
            : "bg-neutral-50 border-neutral-100"
      }`}>
        
        {/* Permission Error */}
        {permissionError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {permissionError}
          </div>
        )}

        {!audioUrl ? (
          <>
            {/* Ready to record or recording */}
            <p className="text-neutral-600 mb-6">
              {isRecording 
                ? "Đang ghi âm... Nhấn để dừng" 
                : "Nhấn nút microphone để bắt đầu ghi âm"}
            </p>

            {/* Recording Button - Centered */}
            <div className="flex justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all text-white shadow-lg ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : ""
                }`}
                style={!isRecording ? { background: "linear-gradient(to right, #00BC7D, #00BBA7)" } : undefined}
              >
                {isRecording ? (
                  <Square className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>

            {/* Recording Timer */}
            {isRecording && (
              <div className="mt-6 text-red-500 font-semibold text-xl">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
                {formatTime(recordingTime)}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recording complete - show playback */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Check className="w-6 h-6 text-green-600" />
              <span className="text-green-700 font-medium">Đã ghi âm xong!</span>
            </div>

            <p className="text-neutral-600 mb-6">
              Thời lượng: {formatTime(recordingTime)}
            </p>

            {/* Playback controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={playRecording}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ background: "linear-gradient(to right, #00BC7D, #00BBA7)" }}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>

              <button
                onClick={reRecord}
                className="w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white shadow-lg"
                title="Ghi lại"
              >
                <RotateCcw className="w-7 h-7" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Fallback Text Input */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <span className="font-medium text-neutral-700">
            Câu trả lời (văn bản - dự phòng)
          </span>
        </div>
        <textarea
          value={(answers[question.id] as string) || ""}
          onChange={(e) => onAnswer(question.id, e.target.value)}
          placeholder="Nhập nội dung bạn muốn nói..."
          className="w-full h-32 p-4 focus:outline-none resize-none"
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-700 mb-2">💡 Mẹo Speaking</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Nói rõ ràng và tự nhiên</li>
          <li>• Sử dụng các linking words (However, Moreover, ...)</li>
          <li>• Trả lời đầy đủ các phần của câu hỏi</li>
          <li>• Đưa ra ví dụ cụ thể khi có thể</li>
        </ul>
      </div>
    </div>
  );
}
