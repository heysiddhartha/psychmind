/**
 * ImageKit Upload Service
 * Uploads PDFs and files to ImageKit (free 20GB plan)
 * ImageKit ID: xhmtd4y5b
 * Endpoint: https://ik.imagekit.io/xhmtd4y5b
 * 
 * Uses private key auth with HMAC-SHA1 signature for secure client-side uploads
 */

const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_trWvWeonci8lOVkpSBja05TMDX4=';
const IMAGEKIT_PRIVATE_KEY = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || 'private_cFMTCDNrZtYVPRFD7Y9/7DZnzKI=';
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/xhmtd4y5b';
const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

export interface ImageKitUploadResult {
    url: string;
    fileId: string;
    name: string;
    filePath: string;
    thumbnailUrl?: string;
    size: number;
}

/**
 * Generate HMAC-SHA1 signature for ImageKit authentication
 * ImageKit requires: signature = HMAC-SHA1(privateKey, token + expire)
 */
async function generateAuthParams(): Promise<{ token: string; expire: string; signature: string }> {
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now

    // Generate HMAC-SHA1 signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(IMAGEKIT_PRIVATE_KEY);
    const messageData = encoder.encode(token + expire.toString());

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = new Uint8Array(signatureBuffer);
    const signature = Array.from(signatureArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return { token, expire: expire.toString(), signature };
}

/**
 * Upload a file (PDF, image, etc.) to ImageKit
 * Uses authenticated upload with HMAC-SHA1 signature
 */
export async function uploadToImageKit(
    file: File | Blob,
    fileName: string,
    folder: string = '/session-notes'
): Promise<{ data: ImageKitUploadResult | null; error: Error | null }> {
    try {
        const { token, expire, signature } = await generateAuthParams();

        const formData = new FormData();
        formData.append('file', file, fileName);
        formData.append('fileName', fileName);
        formData.append('folder', folder);
        formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', signature);
        formData.append('token', token);
        formData.append('expire', expire);
        formData.append('useUniqueFileName', 'true');

        const response = await fetch(IMAGEKIT_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
            data: {
                url: data.url,
                fileId: data.fileId,
                name: data.name,
                filePath: data.filePath,
                thumbnailUrl: data.thumbnailUrl,
                size: data.size,
            },
            error: null,
        };
    } catch (error) {
        console.error('ImageKit upload error:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Upload a base64 encoded file to ImageKit
 */
export async function uploadBase64ToImageKit(
    base64Data: string,
    fileName: string,
    folder: string = '/session-notes'
): Promise<{ data: ImageKitUploadResult | null; error: Error | null }> {
    try {
        const { token, expire, signature } = await generateAuthParams();

        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('fileName', fileName);
        formData.append('folder', folder);
        formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', signature);
        formData.append('token', token);
        formData.append('expire', expire);
        formData.append('useUniqueFileName', 'true');

        const response = await fetch(IMAGEKIT_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
            data: {
                url: data.url,
                fileId: data.fileId,
                name: data.name,
                filePath: data.filePath,
                thumbnailUrl: data.thumbnailUrl,
                size: data.size,
            },
            error: null,
        };
    } catch (error) {
        console.error('ImageKit base64 upload error:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Generate a public URL for an ImageKit file
 */
export function getImageKitUrl(filePath: string): string {
    return `${IMAGEKIT_URL_ENDPOINT}${filePath}`;
}

/**
 * Convert a Blob/File to base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
