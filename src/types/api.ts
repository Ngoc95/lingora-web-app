/**
 * Common API Response Types
 * This file contains shared types used across all API services
 */

/**
 * Standard API response wrapper used by the backend
 * @template T - The type of data contained in metaData
 */
export interface ApiResponse<T> {
    message: string;
    statusCode: number;
    metaData: T;
}

/**
 * Simple message-only response
 */
export interface MessageResponse {
    message: string;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    total: number;
}

/**
 * Common pagination parameters for API requests
 */
export interface PaginationParams {
    limit?: number;
    page?: number;
    search?: string;
}

