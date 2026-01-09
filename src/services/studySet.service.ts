import { api } from './api';
import { ApiResponse } from '@/types/api';
// Import types from forum as requested
import { 
  TargetType, 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  GetCommentsResponse, 
  CommentResponse, 
  LikeResponse,
  LikeMetaData 
} from '@/types/forum';
import type {
  StudySet,
  StudySetListResponse,
  CreateStudySetData,
  UpdateStudySetData,
  StudySetQueryParams,
  BuyStudySetResponse,
  CloudinarySignedMeta,
} from '@/types/studySet';

const CLOUDINARY_API_BASE = 'https://api.cloudinary.com/v1_1';

export const studySetService = {
  // ============================================================
  // Study Set CRUD
  // ============================================================

  /**
   * Get all public study sets
   */
  getAll: async (params?: StudySetQueryParams) => {
    return api.get<ApiResponse<StudySetListResponse>>('/studysets', params);
  },

  /**
   * Get user's own study sets
   */
  getOwn: async (params?: StudySetQueryParams) => {
    return api.get<ApiResponse<StudySetListResponse>>('/studysets/own', params);
  },

  /**
   * Get study set by ID
   */
  getById: async (id: number) => {
    return api.get<ApiResponse<StudySet>>(`/studysets/${id}`);
  },

  /**
   * Create a new study set
   */
  create: async (data: CreateStudySetData) => {
    return api.post<ApiResponse<StudySet>>('/studysets', data);
  },

  /**
   * Update an existing study set
   */
  update: async (id: number, data: UpdateStudySetData) => {
    return api.patch<ApiResponse<StudySet>>(`/studysets/${id}`, data);
  },

  /**
   * Delete a study set
   */
  delete: async (id: number) => {
    return api.delete<ApiResponse<string>>(`/studysets/${id}`);
  },

  /**
   * Buy/acquire a study set
   */
  buy: async (id: number) => {
    return api.post<ApiResponse<BuyStudySetResponse>>(`/studysets/${id}/buy`);
  },

  // ============================================================
  // Social Interactions (Likes & Comments)
  // ============================================================

  /**
   * Like a study set
   */
  likeStudySet: async (id: number) => {
    // Backend expects: POST /likes/:targetId?targetType=STUDY_SET
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/likes/${id}?targetType=STUDY_SET`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to like study set");
    }

    return response.json() as Promise<LikeResponse>;
  },

  /**
   * Unlike a study set
   */
  unlikeStudySet: async (id: number) => {
    // Backend expects: DELETE /likes/:targetId?targetType=STUDY_SET
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/likes/${id}?targetType=STUDY_SET`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to unlike study set");
    }

    return response.json() as Promise<LikeResponse>;
  },

  // Comment methods (Generic or Specific to StudySet)
  
  /**
   * Get comments for a target
   */
  getComments: async (
    targetId: number,
    parentId: number | "null" = "null",
    targetType: TargetType = TargetType.STUDY_SET
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
    targetType: TargetType = TargetType.STUDY_SET
  ) => {
    // Backend creates comment via POST /comments/target/:targetId
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

    return response.json() as Promise<CommentResponse>;
  },

  /**
   * Update a comment
   */
  updateComment: async (
    commentId: number,
    targetId: number,
    data: UpdateCommentRequest,
    targetType: TargetType = TargetType.STUDY_SET
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

      return response.json() as Promise<LikeResponse>;
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

      return response.json() as Promise<LikeResponse>;
  },


  // ============================================================
  // Image Upload (Cloudinary Signed URL Flow)
  // ============================================================

  /**
   * Get signed URL for Cloudinary upload
   */
  getSignedUrl: async (folder: string = 'lingora/images') => {
    const response = await api.get<ApiResponse<CloudinarySignedMeta>>('/uploads/signed-url', { folder });
    return response.metaData;
  },

  /**
   * Upload image directly to Cloudinary using signed URL
   * @returns secure_url of the uploaded image
   */
  uploadToCloudinary: async (
    file: File,
    signedMeta: CloudinarySignedMeta
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signedMeta.apiKey);
    formData.append('timestamp', signedMeta.timestamp.toString());
    formData.append('signature', signedMeta.signature);
    formData.append('folder', signedMeta.folder);

    const response = await fetch(
      `${CLOUDINARY_API_BASE}/${signedMeta.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('Cloudinary response missing secure_url');
    }

    return data.secure_url;
  },

  /**
   * Upload image with full flow: get signed URL → upload to Cloudinary
   * @returns secure_url of the uploaded image
   */
  uploadImage: async (file: File, folder: string = 'lingora/images'): Promise<string> => {
    const signedMeta = await studySetService.getSignedUrl(folder);
    return studySetService.uploadToCloudinary(file, signedMeta);
  },

  /**
   * Upload multiple images in parallel
   * @returns array of secure_urls
   */
  uploadImages: async (
    files: File[],
    folder: string = 'lingora/images'
  ): Promise<string[]> => {
    if (files.length === 0) return [];
    
    // Get one signed URL (can be reused within the timestamp window)
    const signedMeta = await studySetService.getSignedUrl(folder);
    
    // Upload all images in parallel
    const uploadPromises = files.map((file) => studySetService.uploadToCloudinary(file, signedMeta));
    return Promise.all(uploadPromises);
  },
};
