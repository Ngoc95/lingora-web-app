"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Post {
  id: number;
  title: string;
  content: string;
  topic?: string;
  tags: string[];
  owner: { username: string; avatar?: string };
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

const MOCK_POSTS: Post[] = [
  { id: 1, title: "How to improve IELTS speaking?", content: "I need some tips...", topic: "IELTS", tags: ["speaking", "tips"], owner: { username: "learner123" }, likeCount: 15, commentCount: 8, createdAt: "2024-12-20" },
  { id: 2, title: "Best resources for vocabulary", content: "What are your favorite...", topic: "Vocabulary", tags: ["resources"], owner: { username: "student_pro" }, likeCount: 23, commentCount: 12, createdAt: "2024-12-19" },
  { id: 3, title: "Grammar question about tenses", content: "Can someone explain...", topic: "Grammar", tags: ["grammar", "help"], owner: { username: "confused_user" }, likeCount: 7, commentCount: 5, createdAt: "2024-12-18" },
];

export default function ForumPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "all" || post.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Forum</h1>
              <p className="text-neutral-600 mt-1">
                Ask questions and share knowledge
              </p>
            </div>
            <button
              onClick={() => router.push("/forum/create")}
              className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              + New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Topics</option>
              <option value="IELTS">IELTS</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Grammar">Grammar</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/forum/${post.id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {post.owner.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-neutral-900">@{post.owner.username}</span>
                    <span className="text-sm text-neutral-600">• {post.createdAt}</span>
                    {post.topic && (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {post.topic}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-neutral-600 mb-3 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.commentCount}</span>
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-primary">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No posts found
            </h3>
            <p className="text-neutral-600">
              Be the first to start a discussion!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
