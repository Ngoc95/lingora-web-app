// ============================================================
// StudySet Service - API Layer
// ============================================================

import { api, apiClient } from './api';
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

// ============================================================
// Study Set CRUD
// ============================================================

/**
 * Get all public study sets
 */
export async function getAllStudySets(params?: StudySetQueryParams) {
  const response = await api.get<{ metaData: StudySetListResponse }>('/studysets', params);
  return response.metaData;
}

/**
 * Get user's own study sets
 */
export async function getOwnStudySets(params?: StudySetQueryParams) {
  const response = await api.get<{ metaData: StudySetListResponse }>('/studysets/own', params);
  return response.metaData;
}

/**
 * Get study set by ID
 */
export async function getStudySetById(id: number) {
  const response = await api.get<{ metaData: StudySet }>(`/studysets/${id}`);
  return response.metaData;
}

/**
 * Create a new study set
 */
export async function createStudySet(data: CreateStudySetData) {
  const response = await api.post<{ metaData: StudySet }>('/studysets', data);
  return response.metaData;
}

/**
 * Update an existing study set
 */
export async function updateStudySet(id: number, data: UpdateStudySetData) {
  const response = await api.patch<{ metaData: StudySet }>(`/studysets/${id}`, data);
  return response.metaData;
}

/**
 * Delete a study set
 */
export async function deleteStudySet(id: number) {
  const response = await api.delete<{ message: string }>(`/studysets/${id}`);
  return response;
}

/**
 * Buy/acquire a study set
 */
export async function buyStudySet(id: number) {
  const response = await api.post<{ metaData: BuyStudySetResponse }>(`/studysets/${id}/buy`);
  return response.metaData;
}

// ============================================================
// Image Upload (Cloudinary Signed URL Flow)
// ============================================================

/**
 * Get signed URL for Cloudinary upload
 */
export async function getSignedUrl(folder: string = 'lingora/images') {
  const response = await api.get<{ metaData: CloudinarySignedMeta }>('/uploads/signed-url', { folder });
  return response.metaData;
}

/**
 * Upload image directly to Cloudinary using signed URL
 * @returns secure_url of the uploaded image
 */
export async function uploadToCloudinary(
  file: File,
  signedMeta: CloudinarySignedMeta
): Promise<string> {
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
}

/**
 * Upload image with full flow: get signed URL → upload to Cloudinary
 * @returns secure_url of the uploaded image
 */
export async function uploadImage(file: File, folder: string = 'lingora/images'): Promise<string> {
  const signedMeta = await getSignedUrl(folder);
  return uploadToCloudinary(file, signedMeta);
}

/**
 * Upload multiple images in parallel
 * @returns array of secure_urls
 */
export async function uploadImages(
  files: File[],
  folder: string = 'lingora/images'
): Promise<string[]> {
  if (files.length === 0) return [];
  
  // Get one signed URL (can be reused within the timestamp window)
  const signedMeta = await getSignedUrl(folder);
  
  // Upload all images in parallel
  const uploadPromises = files.map((file) => uploadToCloudinary(file, signedMeta));
  return Promise.all(uploadPromises);
}

// ============================================================
// Export as object for convenience
// ============================================================

export const studySetService = {
  // CRUD
  getAll: getAllStudySets,
  getOwn: getOwnStudySets,
  getById: getStudySetById,
  create: createStudySet,
  update: updateStudySet,
  delete: deleteStudySet,
  buy: buyStudySet,
  
  // Upload
  getSignedUrl,
  uploadToCloudinary,
  uploadImage,
  uploadImages,
};
