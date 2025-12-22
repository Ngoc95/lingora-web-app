"use client";

import { Search, Plus, Upload, Download } from "lucide-react";

interface Word {
  id: number;
  word: string;
  phonetic: string;
  type: string;
  vnMeaning: string;
  topicName: string;
}

const MOCK_WORDS: Word[] = [
  { id: 1, word: "hello", phonetic: "/həˈloʊ/", type: "interjection", vnMeaning: "xin chào", topicName: "Greetings" },
  { id: 2, word: "goodbye", phonetic: "/ɡʊdˈbaɪ/", type: "interjection", vnMeaning: "tạm biệt", topicName: "Greetings" },
  { id: 3, word: "one", phonetic: "/wʌn/", type: "number", vnMeaning: "một", topicName: "Numbers" },
];

export default function AdminWordsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Word Management</h1>
            <p className="text-neutral-600 mt-1">Manage all vocabulary words</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-100 rounded-lg font-medium hover:bg-neutral-100/50 transition-colors">
              <Upload className="w-5 h-5" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-100 rounded-lg font-medium hover:bg-neutral-100/50 transition-colors">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-5 h-5" />
              Add Word
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search words..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Words Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100/50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Word</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Phonetic</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Meaning (VN)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MOCK_WORDS.map((word) => (
                <tr key={word.id} className="hover:bg-neutral-100/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-900">{word.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{word.word}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{word.phonetic}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{word.type}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{word.vnMeaning}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{word.topicName}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors">
                        Edit
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
