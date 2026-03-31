/**
 * Cloudinary Upload Service
 * Handles file uploads to Cloudinary for prescriptions, attachments, etc.
 * Falls back to Supabase Storage if Cloudinary is not configured
 */

import { supabase } from '@/lib/supabase';

// Cloudinary configuration - set these in your environment
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export interface UploadResult {
    url: string;
    publicId?: string;
    format?: string;
    resourceType?: string;
    provider: 'cloudinary' | 'supabase';
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
    return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
    file: File,
    folder: string = 'prescriptions'
): Promise<{ data: UploadResult | null; error: Error | null }> {
    if (!isCloudinaryConfigured()) {
        return { data: null, error: new Error('Cloudinary not configured') };
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `3tree/${folder}`);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();

        return {
            data: {
                url: data.secure_url,
                publicId: data.public_id,
                format: data.format,
                resourceType: data.resource_type,
                provider: 'cloudinary',
            },
            error: null,
        };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToSupabase(
    file: File,
    bucket: string = 'attachments',
    folder: string = 'prescriptions'
): Promise<{ data: UploadResult | null; error: Error | null }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            data: {
                url: urlData.publicUrl,
                provider: 'supabase',
            },
            error: null,
        };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Universal upload function - tries Cloudinary first, falls back to Supabase
 */
export async function uploadFile(
    file: File,
    options: {
        folder?: string;
        preferCloudinary?: boolean;
    } = {}
): Promise<{ data: UploadResult | null; error: Error | null }> {
    const { folder = 'attachments', preferCloudinary = true } = options;

    // Try Cloudinary first if preferred and configured
    if (preferCloudinary && isCloudinaryConfigured()) {
        const cloudinaryResult = await uploadToCloudinary(file, folder);
        if (cloudinaryResult.data) {
            return cloudinaryResult;
        }
        // Fall through to Supabase if Cloudinary fails
        console.warn('Cloudinary upload failed, falling back to Supabase:', cloudinaryResult.error);
    }

    // Use Supabase Storage
    return uploadToSupabase(file, 'attachments', folder);
}

/**
 * Upload message attachment
 */
export async function uploadMessageAttachment(
    file: File,
    conversationId: string
): Promise<{ data: UploadResult | null; error: Error | null }> {
    return uploadFile(file, {
        folder: `messages/${conversationId}`,
        preferCloudinary: true,
    });
}

/**
 * Upload prescription PDF
 */
export async function uploadPrescriptionPdf(
    pdfBlob: Blob,
    prescriptionId: string
): Promise<{ data: UploadResult | null; error: Error | null }> {
    const file = new File([pdfBlob], `prescription-${prescriptionId}.pdf`, {
        type: 'application/pdf',
    });

    return uploadFile(file, {
        folder: 'prescriptions',
        preferCloudinary: true,
    });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
    publicId: string
): Promise<{ error: Error | null }> {
    // Note: Cloudinary deletion requires a signed request
    // This would need to be done through a server-side function
    console.warn('Cloudinary deletion requires server-side implementation');
    return { error: null };
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
        mimeType === 'application/pdf' ||
        mimeType.includes('document') ||
        mimeType.includes('text/')
    ) return 'document';
    return 'other';
}

/**
 * Validate file for upload
 */
export function validateFile(
    file: File,
    options: {
        maxSizeMB?: number;
        allowedTypes?: string[];
    } = {}
): { valid: boolean; error?: string } {
    const { maxSizeMB = 10, allowedTypes } = options;

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }

    // Check file type if specified
    if (allowedTypes && allowedTypes.length > 0) {
        const isAllowed = allowedTypes.some(
            (type) =>
                file.type === type ||
                file.type.startsWith(type.replace('*', ''))
        );

        if (!isAllowed) {
            return {
                valid: false,
                error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}`,
            };
        }
    }

    return { valid: true };
}

export default {
    isCloudinaryConfigured,
    uploadToCloudinary,
    uploadToSupabase,
    uploadFile,
    uploadMessageAttachment,
    uploadPrescriptionPdf,
    deleteFromCloudinary,
    getFileCategory,
    validateFile,
};
