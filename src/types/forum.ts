import { User } from "./auth";
import type { ApiResponse, PaginationMeta, PaginationParams } from "./api";

export enum PostTopic {
    GENERAL = "general",
    VOCABULARY = "vocabulary",
    GRAMMAR = "grammar",
    LISTENING = "listening",
    SPEAKING = "speaking",
    READING = "reading",
    WRITING = "writing",
}

export enum PostStatus {
    PUBLISHED = "published",
    ARCHIVED = "archived",
    DELETED = "deleted",
}

export interface Post {
    id: number;
    title: string;
    content: string;
    topic: PostTopic;
    thumbnails: string[];
    tags: string[];
    status: PostStatus;
    createdBy: User;
    likeCount: number;
    commentCount: number;
    isAlreadyLike: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllPostsParams extends PaginationParams {
    sort?: string;
    ownerId?: number;
    topic?: PostTopic;
    tags?: string[];
    status?: string;
}

export interface GetAllPostsMetaData extends PaginationMeta {
    posts: Post[];
    popularTags: string[];
}

export type GetAllPostsResponse = ApiResponse<GetAllPostsMetaData>;

export type GetPostByIdResponse = ApiResponse<Post>;

export interface CreatePostRequest {
    title: string;
    content: string;
    topic?: PostTopic;
    thumbnails?: string[];
    tags?: string[];
}

export interface UpdatePostRequest {
    title?: string;
    content?: string;
    topic?: PostTopic;
    thumbnails?: string[];
    tags?: string[];
    status?: PostStatus;
}

export type PostResponse = ApiResponse<Post>;

export interface LikeMetaData {
    targetId: number;
    targetType: string;
}

export type LikeResponse = ApiResponse<LikeMetaData>;

// Comment types
export enum TargetType {
    POST = "POST",
    COMMENT = "COMMENT",
    STUDY_SET = "STUDY_SET",
}

export interface Comment {
    id: number;
    content: string;
    parentComment: Comment | null;
    createdBy: User;
    targetType: TargetType;
    targetId: number;
    likeCount?: number;
    isAlreadyLike?: boolean;
    createdAt: string;
    updatedAt: string;
}

export type GetCommentsResponse = ApiResponse<Comment[]>;

export interface CreateCommentRequest {
    content: string;
    parentId?: number | null;
}

export interface UpdateCommentRequest {
    content: string;
}

export type CommentResponse = ApiResponse<Comment>;
