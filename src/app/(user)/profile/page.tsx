"use client";

import { useRouter } from "next/navigation";
import { User, Award, TrendingUp, Settings } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const stats = [
    { label: "Words Learned", value: "1,234", icon: "📚" },
    { label: "Study Streak", value: "15 days", icon: "🔥" },
    { label: "Tests Completed", value: "8", icon: "✅" },
    { label: "Study Sets", value: "12", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-black px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-3xl font-bold">
              U
            </div>
            <div>
              <h1 className="text-2xl font-bold">demo_user</h1>
              <p className="text-black/80">demo@lingora.com</p>
              <div className="mt-1 px-3 py-1 bg-white/20 rounded-full text-sm inline-block">
                Level: B1
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 divide-y divide-neutral-100">
          <button
            onClick={() => router.push("/profile/edit")}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-100/50 transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left font-medium text-neutral-900">Edit Profile</span>
            <span className="text-neutral-400">→</span>
          </button>
          <button
            onClick={() => router.push("/profile/achievements")}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-100/50 transition-colors"
          >
            <Award className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left font-medium text-neutral-900">Achievements</span>
            <span className="text-neutral-400">→</span>
          </button>
          <button
            onClick={() => router.push("/profile/progress")}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-100/50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left font-medium text-neutral-900">Learning Progress</span>
            <span className="text-neutral-400">→</span>
          </button>
          <button
            onClick={() => router.push("/profile/withdrawals")}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-100/50 transition-colors"
          >
            <span className="text-xl">💰</span>
            <span className="flex-1 text-left font-medium text-neutral-900">Withdrawals</span>
            <span className="text-neutral-400">→</span>
          </button>
          <button
            onClick={() => router.push("/profile/settings")}
            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-100/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left font-medium text-neutral-900">Settings</span>
            <span className="text-neutral-400">→</span>
          </button>
        </div>

        {/* Logout Button */}
        <button className="w-full mt-6 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}
