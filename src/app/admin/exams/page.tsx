"use client";

import { useState } from "react";
import { Search, Plus, Upload } from "lucide-react";

interface Exam {
  id: number;
  examType: "IELTS" | "TOEIC" | "TOEFL";
  code: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
}

const MOCK_EXAMS: Exam[] = [
  { id: 1, examType: "IELTS", code: "IELTS-001", title: "IELTS Practice Test 1", isPublished: true, createdAt: "2024-12-01" },
  { id: 2, examType: "IELTS", code: "IELTS-002", title: "IELTS Practice Test 2", isPublished: true, createdAt: "2024-12-05" },
  { id: 3, examType: "TOEIC", code: "TOEIC-001", title: "TOEIC Practice Test 1", isPublished: false, createdAt: "2024-12-10" },
];

export default function AdminExamsPage() {
  const [activeTab, setActiveTab] = useState<"exams" | "attempts">("exams");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");

  const filteredExams = MOCK_EXAMS.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || exam.examType === typeFilter;
    const matchesPublished = publishedFilter === "all" || 
                            (publishedFilter === "published" && exam.isPublished) ||
                            (publishedFilter === "unpublished" && !exam.isPublished);
    return matchesSearch && matchesType && matchesPublished;
  });

  const getExamColor = (type: string) => {
    switch (type) {
      case "IELTS": return "bg-blue-100 text-blue-700";
      case "TOEIC": return "bg-green-100 text-green-700";
      case "TOEFL": return "bg-purple-100 text-purple-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Exam Management</h1>
            <p className="text-neutral-600 mt-1">Manage exams and view attempts</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Upload className="w-5 h-5" />
            Import JSON
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: "exams", label: "Exams" },
            { id: "attempts", label: "Attempts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Types</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="TOEFL">TOEFL</option>
              </select>
              <select
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "exams" ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-100/50 border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Published</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-neutral-100/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-neutral-900">{exam.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{exam.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getExamColor(exam.examType)}`}>
                        {exam.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{exam.code}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        exam.isPublished ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {exam.isPublished ? "✅ Yes" : "❌ No"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors">
                          View
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-100 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Exam Attempts
          </h3>
          <p className="text-neutral-600">
            View and manage all exam attempts here
          </p>
        </div>
      )}
    </div>
  );
}
