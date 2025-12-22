"use client";

import { Plus } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  description: string;
  wordCount: number;
  categoryName: string;
}

const MOCK_TOPICS: Topic[] = [
  { id: 1, name: "Greetings", description: "Basic greetings", wordCount: 15, categoryName: "Basic English" },
  { id: 2, name: "Numbers", description: "Numbers 1-100", wordCount: 100, categoryName: "Basic English" },
  { id: 3, name: "Meetings", description: "Business meeting vocabulary", wordCount: 25, categoryName: "Business English" },
];

export default function AdminTopicsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Topic Management</h1>
            <p className="text-neutral-600 mt-1">Manage all vocabulary topics</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            Add Topic
          </button>
        </div>
      </div>

      {/* Topics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100/50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Words</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MOCK_TOPICS.map((topic) => (
                <tr key={topic.id} className="hover:bg-neutral-100/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-900">{topic.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{topic.name}</div>
                      <div className="text-xs text-neutral-600">{topic.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{topic.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{topic.wordCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        Words
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
    </div>
  );
}
