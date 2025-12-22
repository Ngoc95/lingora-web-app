"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";

interface Exam {
  id: number;
  examType: "IELTS" | "TOEIC" | "TOEFL";
  code: string;
  title: string;
  sectionCount: number;
  isPublished: boolean;
}

const MOCK_EXAMS: Exam[] = [
  { id: 1, examType: "IELTS", code: "IELTS-001", title: "IELTS Practice Test 1", sectionCount: 4, isPublished: true },
  { id: 2, examType: "IELTS", code: "IELTS-002", title: "IELTS Practice Test 2", sectionCount: 4, isPublished: true },
  { id: 3, examType: "TOEIC", code: "TOEIC-001", title: "TOEIC Practice Test 1", sectionCount: 2, isPublished: true },
  { id: 4, examType: "TOEFL", code: "TOEFL-001", title: "TOEFL Practice Test 1", sectionCount: 4, isPublished: false },
];

export default function TestsListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredExams = MOCK_EXAMS.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || exam.examType === selectedType;
    return matchesSearch && matchesType && exam.isPublished;
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
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-neutral-900">Test Practice</h1>
          <p className="text-neutral-600 mt-1">
            Choose an exam to practice
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
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

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="TOEFL">TOEFL</option>
            </select>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => router.push(`/practice/tests/${exam.id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getExamColor(exam.examType)}`}>
                      {exam.examType}
                    </span>
                    <span className="text-sm text-neutral-600">{exam.code}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {exam.sectionCount} sections
                  </p>
                </div>
                <button className="px-6 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No exams found
            </h3>
            <p className="text-neutral-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
