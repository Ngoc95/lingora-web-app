import { User } from "./auth";

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

export interface GetAllPostsParams {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    ownerId?: number;
    topic?: PostTopic;
    tags?: string[];
    status?: string;
}

export interface GetAllPostsResponse {
    message: string;
    metaData: {
        posts: Post[];
        popularTags: string[];
        currentPage: number;
        totalPages: number;
        total: number;
    };
}

export interface GetPostByIdResponse {
    message: string;
    metaData: Post;
}

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

export interface PostResponse {
    message: string;
    metaData: Post;
}

export interface LikeResponse {
    message: string;
    metaData: {
        targetId: number;
        targetType: string;
    };
}

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

export interface GetCommentsResponse {
    message: string;
    metaData: Comment[];
}

export interface CreateCommentRequest {
    content: string;
    parentId?: number | null;
}

export interface UpdateCommentRequest {
    content: string;
}

export interface CommentResponse {
    message: string;
    metaData: Comment;
}
