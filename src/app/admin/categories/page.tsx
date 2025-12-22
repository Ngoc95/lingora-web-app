"use client";

import { Plus } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  topicCount: number;
  createdAt: string;
}

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Basic English", description: "Fundamental English vocabulary", topicCount: 12, createdAt: "2024-11-01" },
  { id: 2, name: "Business English", description: "Professional vocabulary", topicCount: 8, createdAt: "2024-11-15" },
  { id: 3, name: "Travel English", description: "Vocabulary for travelers", topicCount: 6, createdAt: "2024-12-01" },
];

export default function AdminCategoriesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Category Management</h1>
            <p className="text-neutral-600 mt-1">Manage vocabulary categories</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-2xl">
                📚
              </div>
              <button className="text-neutral-400 hover:text-primary transition-colors">
                ⋮
              </button>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {category.name}
            </h3>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {category.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">{category.topicCount} topics</span>
              <button className="text-primary font-medium hover:underline">
                View Topics →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
