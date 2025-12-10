/**
 * Installer API Client
 * Centralized fetch wrappers for all installer endpoints
 * 
 * Features:
 * - TypeScript types for all requests/responses
 * - Consistent error handling
 * - Session management
 * - Request/response logging (dev mode)
 */

// ============================================================================
// Types
// ============================================================================

export interface VerificationFormData {
  // Company & Representative
  companyName: string;
  representativeName: string;
  designation: string;
  email: string;
  phone: string;
  
  // Business Legal
  abnOrLicense: string;
  establishedYear: number;
  employeeCount: number;
  licenseDocKey?: string;
  abnDocKey?: string;
  
  // Services & Coverage
  services: string[];
  serviceAreas: string[];
  postcodes: string[];
  
  // Additional Information
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  companyDescription?: string;
  logoKey?: string;
}

export interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    phoneVerified: boolean;
    companyName: string | null;
    installerVerified: boolean;
    image: string | null;
  };
  profile: {
    operationalStatus: 'ACTIVE' | 'PAUSED' | 'INACTIVE';
  } | null;
  verification: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO';
    companyName: string;
    representativeName: string;
    designation: string;
    email: string;
    phone: string;
    address: string | null;
    abnOrLicense: string;
    establishedYear: number;
    employeeCount: number;
    services: string[];
    serviceAreas: string[];
    postcodes: string[];
    website: string | null;
    socialLinks: any;
    companyDescription: string | null;
    licenseDocKey: string | null;
    abnDocKey: string | null;
    logoKey: string | null;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  preferences: {
    alertNewLead: boolean;
    alertLeadUpdates: boolean;
    alertAdminMessages: boolean;
    alertVerificationUpdates: boolean;
    alertAccountActivity: boolean;
  } | null;
}

export interface ProfileUpdateData {
  services?: string[];
  serviceAreas?: string[];
  postcodes?: string[];
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  companyDescription?: string;
  phone?: string;
}

export interface PreferencesData {
  alertNewLead: boolean;
  alertLeadUpdates: boolean;
  alertAdminMessages: boolean;
  alertVerificationUpdates: boolean;
  alertAccountActivity: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface VerificationSubmitResponse {
  success: boolean;
  verification: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ============================================================================
// Error Handling
// ============================================================================

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJSON = contentType?.includes('application/json');
  
  if (!response.ok) {
    const errorData = isJSON ? await response.json() : await response.text();
    const errorMessage = typeof errorData === 'object' && errorData.error 
      ? errorData.error 
      : errorData;
    
    throw new APIError(
      response.status,
      response.statusText,
      errorData,
      errorMessage
    );
  }
  
  if (isJSON) {
    return response.json();
  }
  
  return {} as T;
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Submit or update installer verification application
 * POST /api/installer/verification/submit
 */
export async function submitVerification(
  data: VerificationFormData
): Promise<VerificationSubmitResponse> {
  const response = await fetch('/api/installer/verification/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return handleResponse<VerificationSubmitResponse>(response);
}

/**
 * Fetch aggregated installer profile data
 * GET /api/installer/profile
 */
export async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/installer/profile', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<ProfileData>(response);
}

/**
 * Update installer profile (post-approval editable fields)
 * PUT /api/installer/profile
 */
export async function updateProfile(
  data: ProfileUpdateData
): Promise<{ success: boolean; profile: any }> {
  const response = await fetch('/api/installer/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return handleResponse<{ success: boolean; profile: any }>(response);
}

/**
 * Get presigned URL for uploading file to S3
 * GET /api/installer/uploads/presign
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  fileType: 'document' | 'logo'
): Promise<PresignedUploadResponse> {
  const params = new URLSearchParams({
    filename,
    contentType,
    fileType,
  });
  
  const response = await fetch(`/api/installer/uploads/presign?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<PresignedUploadResponse>(response);
}

/**
 * Upload file directly to S3 using presigned URL
 * PUT {presignedUrl}
 */
export async function uploadToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });
    
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Complete file upload workflow: get presigned URL + upload to S3
 * Returns S3 key for storing in database
 */
export async function uploadDocument(
  file: File,
  fileType: 'document' | 'logo',
  onProgress?: (progress: number) => void
): Promise<string> {
  // 1. Get presigned URL
  const { uploadUrl, key } = await getPresignedUploadUrl(
    file.name,
    file.type,
    fileType
  );
  
  // 2. Upload to S3
  await uploadToS3(uploadUrl, file, onProgress);
  
  // 3. Return key
  return key;
}

/**
 * Fetch installer preferences
 * GET /api/installer/preferences
 */
export async function fetchPreferences(): Promise<PreferencesData> {
  const response = await fetch('/api/installer/preferences', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<PreferencesData>(response);
}

/**
 * Update installer preferences
 * PUT /api/installer/preferences
 */
export async function updatePreferences(
  data: Partial<PreferencesData>
): Promise<{ success: boolean; preferences: PreferencesData }> {
  const response = await fetch('/api/installer/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return handleResponse<{ success: boolean; preferences: PreferencesData }>(response);
}

/**
 * Toggle installer operational status (ACTIVE/PAUSED)
 * PUT /api/installer/account/status
 */
export async function toggleOperationalStatus(
  status: 'ACTIVE' | 'PAUSED'
): Promise<{ success: boolean; status: string }> {
  const response = await fetch('/api/installer/account/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  
  return handleResponse<{ success: boolean; status: string }>(response);
}

/**
 * Change installer password
 * POST /api/installer/account/change-password
 */
export async function changePassword(
  data: PasswordChangeData
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/installer/account/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return handleResponse<{ success: boolean; message: string }>(response);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    if (typeof error.data === 'object' && error.data.error) {
      return error.data.error;
    }
    if (typeof error.data === 'string') {
      return error.data;
    }
    return `Error: ${error.status} ${error.statusText}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
