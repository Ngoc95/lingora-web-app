"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, BookOpen, Clock, ChevronRight, Loader2 } from "lucide-react";
import { examService } from "@/services/exam.service";
import { ExamAttempt } from "@/types/exam";

const FEATURES = [
  {
    id: "test-practice",
    title: "Luyện đề thi",
    description: "Luyện đề thi IELTS",
    icon: FileText,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-100",
    route: "/practice/tests",
  },
  {
    id: "vocab-review",
    title: "Ôn tập từ vựng",
    description: "Ôn lại từ đã học theo SRS",
    icon: BookOpen,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-100",
    route: "/practice/review",
  },
];

export default function PracticePage() {
  const router = useRouter();
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const response = await examService.listAttempts({ page: 1, limit: 3 });
        setRecentAttempts(response.attempts);
      } catch {
        // Silently fail for recent activity
      } finally {
        setLoading(false);
      }
    };
    loadRecent();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">Luyện tập</h1>
          <p className="text-neutral-600 mt-1">
            Chọn chế độ luyện tập để nâng cao kỹ năng
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => router.push(feature.route)}
                className="w-full bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-neutral-100 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}
                      style={{
                        color:
                          feature.id === "test-practice" ? "#9333ea" : "#10b981",
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Hoạt động gần đây
            </h2>
            <button
              onClick={() => router.push("/practice/tests?tab=history")}
              className="text-sm text-primary hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">Chưa có hoạt động nào</p>
              <button
                onClick={() => router.push("/practice/tests")}
                className="mt-3 text-primary hover:underline text-sm"
              >
                Bắt đầu luyện tập ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <button
                  key={attempt.id}
                  onClick={() => router.push(`/practice/attempts/${attempt.id}`)}
                  className="w-full flex items-center justify-between p-3 bg-neutral-100/50 rounded-lg hover:bg-neutral-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900">
                        {attempt.examTitle || `Attempt #${attempt.id}`}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {formatDate(attempt.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {attempt.scoreSummary?.overallBand ? (
                      <p className="font-semibold text-primary">
                        Band {attempt.scoreSummary.overallBand.toFixed(1)}
                      </p>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          attempt.status === "SUBMITTED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {attempt.status === "SUBMITTED" ? "Hoàn thành" : "Đang làm"}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
