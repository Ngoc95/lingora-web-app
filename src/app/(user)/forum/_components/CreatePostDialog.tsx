"use client";

import { useState, useEffect, useRef } from "react";
import { Post, PostTopic, CreatePostRequest } from "@/types/forum";
import { TOPIC_LABELS } from "@/constants/forum";
import { forumService } from "@/services/forum.service";
import { uploadService } from "@/services/upload.service";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreatePostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreatePostRequest) => Promise<void>;
    initialData?: Post | null;
}

export function CreatePostDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: CreatePostDialogProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [topic, setTopic] = useState<PostTopic>(PostTopic.GENERAL);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [popularTags, setPopularTags] = useState<string[]>([]);

    interface ImageItem {
        id: string;
        file?: File;
        preview: string;
        url?: string;
        uploading: boolean;
        error?: string;
    }
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial load and fetch popular tags
    useEffect(() => {
        if (open) {
            // Pre-fill data if editing
            if (initialData) {
                setTitle(initialData.title);
                setContent(initialData.content);
                setTopic((initialData.topic as unknown as PostTopic) || PostTopic.GENERAL);
                setTags(initialData.tags || []);
                const initialImages = (initialData.thumbnails || []).map((url) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    preview: url,
                    url: url,
                    uploading: false,
                }));
                setImageItems(initialImages);
            } else {
                // Reset form for create mode
                setTitle("");
                setContent("");
                setTopic(PostTopic.GENERAL);
                setTags([]);
                setImageItems([]);
                setTagInput("");
            }

            const fetchPopularTags = async () => {
                setTagsLoading(true);
                try {
                    const response = await forumService.getAllPosts({ limit: 1 });
                    if (response.metaData.popularTags) {
                        setPopularTags(response.metaData.popularTags);
                    }
                } catch (error) {
                    console.error("Failed to fetch popular tags:", error);
                    setPopularTags([]);
                } finally {
                    setTagsLoading(false);
                }
            };
            fetchPopularTags();
        }
    }, [open, initialData]);

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
            setTags([...tags, trimmed]);
            setTagInput("");
        }
    };

    const handleTogglePopularTag = (tag: string) => {
        if (tags.includes(tag)) {
            setTags(tags.filter((t) => t !== tag));
        } else if (tags.length < 5) {
            setTags([...tags, tag]);
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newItems: ImageItem[] = [];

        // Process files to create previews and initial items
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) {
                alert(`File ${file.name} không phải là hình ảnh`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImageItems((prev) => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        file: file,
                        preview: reader.result as string,
                        uploading: false,
                    },
                ]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (id: string) => {
        setImageItems(imageItems.filter((item) => item.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            return;
        }

        setLoading(true);
        try {
            // Filter images that need uploading (have file but no url)
            const imagesToUpload = imageItems.filter(item => item.file && !item.url);
            const uploadedItems = [...imageItems];

            // Upload new images
            if (imagesToUpload.length > 0) {
                // Update uploading state for UI
                setImageItems(prev => prev.map(item =>
                    item.file && !item.url ? { ...item, uploading: true } : item
                ));

                await Promise.all(imagesToUpload.map(async (item) => {
                    try {
                        if (!item.file) return;
                        const response = await uploadService.uploadImage(item.file);
                        const secureUrl = response.metaData.secure_url;

                        // Update the item in the local array to get ready for submit
                        const index = uploadedItems.findIndex(i => i.id === item.id);
                        if (index !== -1) {
                            uploadedItems[index] = { ...uploadedItems[index], url: secureUrl, uploading: false };
                        }
                    } catch (error) {
                        console.error(`Failed to upload image ${item.id}:`, error);
                        const index = uploadedItems.findIndex(i => i.id === item.id);
                        if (index !== -1) {
                            uploadedItems[index] = { ...uploadedItems[index], error: "Lỗi upload", uploading: false };
                        }
                    }
                }));

                // Update state to reflect changes
                setImageItems(uploadedItems);
            }

            // Check for upload errors
            if (uploadedItems.some(i => i.error)) {
                if (!confirm("Một số hình ảnh bị lỗi upload. Bạn có muốn tiếp tục đăng bài mà không có chúng?")) {
                    setLoading(false);
                    return;
                }
            }

            const finalUrls = uploadedItems
                .filter(i => i.url && !i.error)
                .map(i => i.url!);

            const payload = {
                title,
                content,
                topic,
                tags: tags.length > 0 ? tags : undefined,
                thumbnails: finalUrls.length > 0 ? finalUrls : undefined,
            };
            console.log("Submitting post payload:", payload);

            await onSubmit(payload);

            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create/update post:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            maxLength={128}
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Chia sẻ suy nghĩ của bạn..."
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                            required
                        />
                    </div>

                    {/* Topic */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Chủ đề
                        </label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value as PostTopic)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            {Object.entries(TOPIC_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Tags (Tối đa 5)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="Nhập tag..."
                                className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <Button
                                type="button"
                                onClick={handleAddTag}
                                variant="outline"
                                disabled={tags.length >= 5}
                            >
                                Thêm
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:bg-blue-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Popular Tags */}
                        <div className="mt-3">
                            <p className="text-sm text-neutral-600 mb-2">Tags phổ biến:</p>
                            <div className="flex flex-wrap gap-2">
                                {tagsLoading ? (
                                    <p className="text-sm text-neutral-400">Đang tải...</p>
                                ) : popularTags.length > 0 ? (
                                    popularTags.map((tag) => {
                                        const isSelected = tags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTogglePopularTag(tag)}
                                                disabled={!isSelected && tags.length >= 5}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${isSelected
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                #{tag}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-neutral-400 italic">Chưa có tags phổ biến</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Hình ảnh
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            onClick={handleAddImageClick}
                            variant="outline"
                            className="w-full mb-2"
                        >
                            Chọn ảnh từ máy
                        </Button>
                        {imageItems.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {imageItems.map((item) => (
                                    <div key={item.id} className="relative group aspect-video">
                                        <img
                                            src={item.preview}
                                            alt="Thumbnail"
                                            className={`w-full h-full object-cover rounded-md border border-neutral-200 ${item.uploading ? 'opacity-50' : ''}`}
                                        />
                                        {item.uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                            </div>
                                        )}
                                        {item.error && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                                                <span className="text-red-500 font-bold text-xs bg-white px-2 py-1 rounded">Lỗi</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(item.id)}
                                            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4 text-neutral-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
                            {loading ? (initialData ? "Đang lưu..." : "Đang đăng...") : (initialData ? "Lưu thay đổi" : "Đăng bài")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
