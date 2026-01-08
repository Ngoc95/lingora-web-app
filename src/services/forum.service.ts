import { api } from "./api";
import { TargetType } from "@/types/forum";
import type {
    GetAllPostsParams,
    GetAllPostsResponse,
    GetPostByIdResponse,
    CreatePostRequest,
    UpdatePostRequest,
    PostResponse,
    LikeResponse,
    GetCommentsResponse,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentResponse,
} from "@/types/forum";

export const forumService = {
    /**
     * Get all posts with optional filters
     */
    getAllPosts: async (params?: GetAllPostsParams) => {
        const queryParams: Record<string, string | number | boolean | null | undefined> = {};

        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.sort) queryParams.sort = params.sort;
        if (params?.search) queryParams.search = params.search;
        if (params?.ownerId) queryParams.ownerId = params.ownerId;
        if (params?.topic) queryParams.topic = params.topic.toLowerCase();
        if (params?.status) queryParams.status = params.status;
        if (params?.tags && params.tags.length > 0) {
            queryParams.tags = params.tags.join(",");
        }

        return api.get<GetAllPostsResponse>("/posts", queryParams);
    },

    /**
     * Get post by ID
     */
    getPostById: async (id: number) => {
        return api.get<GetPostByIdResponse>(`/posts/${id}`);
    },

    /**
     * Create a new post
     */
    createPost: async (data: CreatePostRequest) => {
        return api.post<PostResponse>("/posts", data);
    },

    /**
     * Update a post
     */
    updatePost: async (id: number, data: UpdatePostRequest) => {
        return api.patch<PostResponse>(`/posts/${id}`, data);
    },

    /**
     * Delete a post
     */
    deletePost: async (id: number) => {
        return api.delete<PostResponse>(`/posts/${id}`);
    },

    /**
     * Like a post
     */
    likePost: async (postId: number) => {
        // Backend expects: POST /likes/:targetId?targetType=POST
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/likes/${postId}?targetType=POST`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to like post");
        }

        return response.json();
    },

    /**
     * Unlike a post
     */
    unlikePost: async (postId: number) => {
        // Backend expects: DELETE /likes/:targetId?targetType=POST
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/likes/${postId}?targetType=POST`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to unlike post");
        }

        return response.json();
    },

    // Comment methods
    /**
     * Get comments for a target (post/comment/study-set)
     * @param targetId - ID of the target
     * @param parentId - ID of parent comment, or 'null' for top-level comments
     * @param targetType - Type of target (default: POST)
     */
    getComments: async (
        targetId: number,
        parentId: number | "null" = "null",
        targetType: TargetType = TargetType.POST
    ) => {
        return api.get<GetCommentsResponse>(
            `/comments/target/${targetId}/parent/${parentId}`,
            { targetType }
        );
    },

    /**
     * Create a comment
     */
    createComment: async (
        targetId: number,
        data: CreateCommentRequest,
        targetType: TargetType = TargetType.POST
    ) => {
        // Backend expects targetType as query param
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/comments/target/${targetId}?targetType=${targetType}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
            },
            credentials: "include",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to create comment");
        }

        return response.json();
    },

    /**
     * Update a comment
     */
    updateComment: async (
        commentId: number,
        targetId: number,
        data: UpdateCommentRequest,
        targetType: TargetType = TargetType.POST
    ) => {
        return api.patch<CommentResponse>(
            `/comments/${commentId}/target/${targetId}?targetType=${targetType}`,
            data
        );
    },

    /**
     * Delete a comment
     */
    deleteComment: async (commentId: number) => {
        return api.delete<CommentResponse>(`/comments/${commentId}`);
    },

    /**
     * Like a comment
     */
    likeComment: async (commentId: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/likes/${commentId}?targetType=COMMENT`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to like comment");
        }

        return response.json();
    },

    /**
     * Unlike a comment
     */
    unlikeComment: async (commentId: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/likes/${commentId}?targetType=COMMENT`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to unlike comment");
        }

        return response.json();
    },
};
