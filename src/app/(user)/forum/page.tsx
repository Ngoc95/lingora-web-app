"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Post, PostTopic, PostStatus, CreatePostRequest } from "@/types/forum";
import { forumService } from "@/services/forum.service";
import { FilterBar } from "./_components/FilterBar";
import { PostCard } from "./_components/PostCard";

import { CreatePostDialog } from "./_components/CreatePostDialog";
import { Pagination } from "./_components/Pagination";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForumPage() {
  const router = useRouter();

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<PostTopic | null>(null);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [myPostsStatus, setMyPostsStatus] = useState<PostStatus>(PostStatus.PUBLISHED);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.userId);
        } catch (e) {
          console.error("Failed to parse token:", e);
        }
      }
    }
  }, []);

  // Load posts
  const loadPosts = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await forumService.getAllPosts({
        page,
        limit: 10,
        sort: "-createdAt",
        search: appliedSearch || undefined,
        tags: appliedTags.length > 0 ? appliedTags : undefined,
        topic: selectedTopic || undefined,
        ownerId: showMyPosts ? currentUserId : undefined,
        status: showMyPosts ? myPostsStatus.toLowerCase() : undefined,
      });

      const { posts: newPosts, currentPage: cp, totalPages: tp } = response.metaData;

      setPosts(newPosts);

      // Scroll to top when page changes
      if (page > 1 || cp !== 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setCurrentPage(cp);
      setTotalPages(tp);
      setHasMore(cp < tp);
    } catch (err: any) {
      setError(err.message || "Không thể tải bài viết");
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, appliedTags, selectedTopic, showMyPosts, myPostsStatus, currentUserId]);

  // Initial load and reload on filter changes
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // Apply search text with debounce (not tags - they apply immediately)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(searchInput.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handlers
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleAddTag = (tag: string) => {
    if (!searchTags.includes(tag)) {
      const newTags = [...searchTags, tag];
      setSearchTags(newTags);
      // Immediately apply filters like mobile app
      setAppliedTags(newTags);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = searchTags.filter((t) => t !== tag);
    setSearchTags(newTags);
    // Immediately apply filters like mobile app
    setAppliedTags(newTags);
  };

  const handleTopicSelect = (topic: PostTopic | null) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
  };

  const handleShowMyPostsChange = (show: boolean) => {
    if (show && !currentUserId) {
      toast.error("Vui lòng đăng nhập để xem bài viết của bạn");
      return;
    }
    setShowMyPosts(show);
    setCurrentPage(1);
  };

  const handleMyPostsStatusChange = (status: PostStatus) => {
    setMyPostsStatus(status);
    setCurrentPage(1);
  };

  const handleSavePost = async (data: CreatePostRequest) => {
    try {
      if (editingPost) {
        await forumService.updatePost(editingPost.id, data);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await forumService.createPost(data);
        toast.success("Đăng bài thành công!");
      }
      loadPosts(currentPage);
      setEditingPost(null); // Reset editing state
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu bài viết");
      throw err;
    }
  };

  const handleLikePost = async (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isLiked = post.isAlreadyLike;
    const delta = isLiked ? -1 : 1;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            isAlreadyLike: !isLiked,
            likeCount: Math.max(0, p.likeCount + delta),
          }
          : p
      )
    );

    try {
      if (isLiked) {
        await forumService.unlikePost(postId);
      } else {
        await forumService.likePost(postId);
      }
    } catch (err: any) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              isAlreadyLike: isLiked,
              likeCount: Math.max(0, p.likeCount - delta),
            }
            : p
        )
      );
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleUpdatePostStatus = async (postId: number, status: PostStatus) => {
    try {
      await forumService.updatePost(postId, { status });
      toast.success("Cập nhật trạng thái thành công!");
      loadPosts(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      await forumService.deletePost(postId);
      toast.success("Xóa bài viết thành công!");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa bài viết");
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Diễn đàn</h1>
              <p className="text-neutral-600 mt-1">
                Đặt câu hỏi và chia sẻ kiến thức
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Tạo bài viết
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchInput={searchInput}
        searchTags={searchTags}
        selectedTopic={selectedTopic}
        showMyPosts={showMyPosts}
        myPostsStatus={myPostsStatus}
        onSearchInputChange={handleSearchInputChange}
        onRemoveTag={handleRemoveTag}
        onAddTag={handleAddTag}
        onTopicSelect={handleTopicSelect}
        onShowMyPostsChange={handleShowMyPostsChange}
        onMyPostsStatusChange={handleMyPostsStatusChange}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && posts.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={() => loadPosts(1)} variant="outline">
              Thử lại
            </Button>
          </div>
        )}

        {/* Posts List */}
        {posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isViewingArchived={showMyPosts && myPostsStatus === PostStatus.ARCHIVED}
                onClick={() => router.push(`/forum/${post.id}`)}
                onLikeClick={() => handleLikePost(post.id)}
                onEditPost={() => {
                  setEditingPost(post);
                  setCreateDialogOpen(true);
                }}
                onChangeStatus={(status) => handleUpdatePostStatus(post.id, status)}
                onDeletePost={() => handleDeletePost(post.id)}
                onTopicClick={(topic) => handleTopicSelect(topic)}
                onTagClick={(tag) => handleAddTag(tag)}
              />
            ))}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => loadPosts(page)}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Chưa có bài viết nào
            </h3>
            <p className="text-neutral-600 mb-4">
              Hãy là người đầu tiên bắt đầu cuộc thảo luận!
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Tạo bài viết
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingPost(null);
        }}
        onSubmit={handleSavePost}
        initialData={editingPost}
      />
    </div>
  );
}
