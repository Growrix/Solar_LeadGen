/**
 * AWS S3 Client Singleton
 * 
 * Purpose: Store and retrieve files (installer documents, quote attachments)
 * Used for: Document uploads, presigned URLs, file retrieval
 * 
 * Why S3?
 * - Scalable file storage
 * - Secure presigned URLs (temporary access)
 * - Cost-effective
 * - Direct browser uploads (no server bandwidth)
 * 
 * Usage:
 *   import { uploadFile, getPresignedUrl } from '@/lib/s3';
 *   
 *   // Upload file
 *   const key = await uploadFile(fileBuffer, 'documents/cert.pdf', 'application/pdf');
 *   
 *   // Get download URL
 *   const url = await getPresignedUrl(key);
 * 
 * Environment Variables Required:
 * - AWS_REGION: Your AWS region (e.g.,"us-east-1")
 * - AWS_ACCESS_KEY_ID: Your AWS access key ID
 * - AWS_SECRET_ACCESS_KEY: Your AWS secret access key
 * - AWS_S3_BUCKET: Your S3 bucket name
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate environment variables at startup
if (!process.env.AWS_REGION) {
  console.warn('⚠️ [S3] AWS_REGION not configured - file uploads will not work');
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.warn('⚠️ [S3] AWS_ACCESS_KEY_ID not configured - file uploads will not work');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️ [S3] AWS_SECRET_ACCESS_KEY not configured - file uploads will not work');
}
if (!process.env.AWS_S3_BUCKET) {
  console.warn('⚠️ [S3] AWS_S3_BUCKET not configured - file uploads will not work');
}

/**
 * S3 client singleton
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

/**
 * Upload a file to S3
 * 
 * @param fileBuffer - File content as Buffer
 * @param key - S3 object key (file path in bucket, e.g.,"documents/cert.pdf")
 * @param contentType - MIME type (e.g.,"application/pdf","image/jpeg")
 * @returns The S3 key of the uploaded file
 * 
 * File Organization:
 * - Installer documents: documents/installer-{id}/{filename}
 * - Quote attachments: quotes/{quoteId}/{filename}
 * 
 * Example:
 *   const buffer = await file.arrayBuffer();
 *   const key = await uploadFile(
 *     Buffer.from(buffer),
 *     `documents/installer-${userId}/certificate.pdf`,
 *     'application/pdf'
 *   );
 */
export async function uploadFile(
  fileBuffer: any, // Buffer type - using any to avoid Node type issues
  key: string,
  contentType: string
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is required');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [S3] File uploaded: ${key}`);
    }

    return key;
  } catch (error) {
    console.error('❌ [S3] Failed to upload file:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Get a presigned URL for downloading a file
 * 
 * Presigned URLs:
 * - Temporary access to private S3 objects
 * - No AWS credentials needed by end user
 * - Expires after specified time (default: 1 hour)
 * - Secure - signed with your AWS credentials
 * 
 * @param key - S3 object key (file path)
 * @param expiresIn - URL expiry time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL for downloading the file
 * 
 * Example:
 *   const url = await getPresignedUrl('documents/installer-123/cert.pdf');
 *   // Send URL to frontend
 *   // User can download file directly from S3 for 1 hour
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is required');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [S3] Generated presigned URL for: ${key}`);
    }

    return url;
  } catch (error) {
    console.error('❌ [S3] Failed to generate presigned URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Get a presigned URL for uploading a file (client-side direct upload)
 * 
 * Client-Side Upload Flow:
 * 1. Backend generates presigned POST URL
 * 2. Frontend uploads file directly to S3 (no server bandwidth)
 * 3. S3 returns success/failure
 * 4. Frontend notifies backend of upload completion
 * 
 * @param key - S3 object key (file path where file will be stored)
 * @param contentType - MIME type
 * @param expiresIn - URL expiry time in seconds (default: 300 = 5 minutes)
 * @returns Presigned URL for uploading
 * 
 * Example:
 *   const uploadUrl = await getPresignedUploadUrl(
 *     `documents/installer-${userId}/cert.pdf`,
 *     'application/pdf'
 *   );
 *   // Send uploadUrl to frontend
 *   // Frontend can PUT file directly to this URL
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is required');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [S3] Generated presigned upload URL for: ${key}`);
    }

    return url;
  } catch (error) {
    console.error('❌ [S3] Failed to generate presigned upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

/**
 * Delete a file from S3
 * 
 * Use cases:
 * - User deletes their account
 * - Document is rejected and needs to be removed
 * - Quote attachment is no longer needed
 * 
 * @param key - S3 object key (file path)
 * @returns Promise that resolves when file is deleted
 * 
 * Example:
 *   await deleteFile('documents/installer-123/old-cert.pdf');
 */
export async function deleteFile(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET environment variable is required');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [S3] File deleted: ${key}`);
    }
  } catch (error) {
    console.error('❌ [S3] Failed to delete file:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Generate a unique file key with timestamp
 * 
 * Format: {prefix}/{userId}/{timestamp}-{filename}
 * 
 * Why timestamps?
 * - Prevents filename collisions
 * - Maintains chronological order
 * - Easier to debug and audit
 * 
 * @param userId - User ID
 * @param filename - Original filename
 * @param prefix - Folder prefix (e.g.,"documents","quotes")
 * @returns Unique S3 key
 * 
 * Example:
 *   generateFileKey('user-123', 'certificate.pdf', 'documents')
 *   // Returns:"documents/user-123/1705310400000-certificate.pdf"
 */
export function generateFileKey(
  userId: string,
  filename: string,
  prefix: string = 'documents'
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${prefix}/${userId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Validate file size
 * 
 * @param fileSizeInBytes - File size in bytes
 * @param maxSizeInMB - Maximum allowed size in megabytes
 * @returns True if file size is valid
 * 
 * Example:
 *   if (!isValidFileSize(file.size, 5)) {
 *     throw new Error('File must be less than 5MB');
 *   }
 */
export function isValidFileSize(fileSizeInBytes: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSizeInBytes <= maxSizeInBytes;
}

/**
 * Validate file type
 * 
 * @param contentType - MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is valid
 * 
 * Example:
 *   if (!isValidFileType(file.type, ['application/pdf', 'image/jpeg'])) {
 *     throw new Error('Only PDF and JPEG files are allowed');
 *   }
 */
export function isValidFileType(
  contentType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(contentType);
}

/**
 * Common allowed file types
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];
