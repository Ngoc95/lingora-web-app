"use client";

import { useRouter } from "next/navigation";
import { Mic, BookOpen, RotateCcw, FileText } from "lucide-react";

const FEATURES = [
  {
    id: "pronunciation",
    title: "Pronunciation Practice",
    description: "Improve your speaking skills",
    icon: Mic,
    color: "from-blue-500 to-blue-600",
    route: "/practice/pronunciation",
  },
  {
    id: "test-practice",
    title: "Test Practice",
    description: "IELTS, TOEIC, TOEFL exams",
    icon: FileText,
    color: "from-primary to-primary-light",
    route: "/practice/tests",
  },
  {
    id: "vocab-review",
    title: "Vocabulary Review",
    description: "Review learned words",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600",
    route: "/practice/review",
  },
  {
    id: "custom-review",
    title: "Custom Review",
    description: "Create custom practice sets",
    icon: RotateCcw,
    color: "from-orange-500 to-orange-600",
    route: "/practice/custom",
  },
];

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">Practice</h1>
          <p className="text-neutral-600 mt-1">
            Choose a practice mode to improve your skills
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => router.push(feature.route)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 text-left group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-100/50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">IELTS Practice Test 1</p>
                <p className="text-sm text-neutral-600">Completed 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">Band 6.5</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-100/50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Vocabulary Review</p>
                <p className="text-sm text-neutral-600">Completed yesterday</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">45/50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
