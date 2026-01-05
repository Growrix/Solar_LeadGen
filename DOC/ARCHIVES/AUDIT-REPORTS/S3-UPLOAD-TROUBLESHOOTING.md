# S3 File Upload Troubleshooting Guide

## Problem
File uploads failing with "Upload failed due to network error" in the Installer Verification Modal.

## Root Cause Analysis

Based on the audit, here's what we found:

### ✅ Working Components:
1. **Frontend Code** - VerificationModal.tsx properly implements file upload UI
2. **File Upload Hook** - useMultiFileUpload correctly handles upload logic
3. **Backend API** - /api/installer/uploads/presign generates presigned URLs successfully
4. **S3 Library** - src/lib/s3.ts properly configured
5. **Environment Variables** - All AWS credentials are set (redacted for security):
  - AWS_REGION
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_S3_BUCKET

### ❌ The Issue: **S3 Bucket CORS Configuration**

When you upload a file directly from the browser to S3:
1. Browser gets presigned URL from Next.js API ✅
2. Browser tries to PUT file directly to S3 URL ❌
3. **S3 rejects the request due to missing CORS headers**
4. Browser shows "network error" (CORS blocks are shown as network errors)

The S3 bucket `solar-lead-gen` in `ap-southeast-2` region **does not have CORS rules configured** to allow PUT requests from `http://localhost:3000`.

## Solution

### Option 1: Set CORS via AWS Console (Recommended)

1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/s3/buckets/solar-lead-gen?region=ap-southeast-2&tab=permissions
2. Click on "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the following CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://*.vercel.app",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-request-id"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. Click "Save changes"

### Option 2: Set CORS via AWS CLI

```bash
aws s3api put-bucket-cors --bucket solar-lead-gen --cors-configuration file://cors-config.json --region ap-southeast-2
```

Where `cors-config.json` contains:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app"
      ],
      "ExposeHeaders": ["ETag", "x-amz-request-id"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Option 3: Set CORS via Node.js Script

Run the script we created:

```bash
npx tsx scripts/set-s3-cors.ts
```

## Testing After Fix

1. Refresh your browser (clear cache: Ctrl+Shift+R)
2. Go to Installer Verification Modal
3. Try uploading a file again
4. You should see:
   - "Uploading... X%"
   - "Uploaded successfully" ✅

## Why This Happens

**CORS (Cross-Origin Resource Sharing)** is a security feature in browsers:

- Your frontend runs on `http://localhost:3000`
- S3 bucket is at `https://solar-lead-gen.s3.ap-southeast-2.amazonaws.com`
- These are different origins!
- Browser blocks the request unless S3 explicitly allows it via CORS headers

Without CORS:
```
Browser → S3: "Can I PUT a file here?"
S3 → Browser: *silence* (no CORS headers)
Browser: "No CORS headers = BLOCKED" → Shows as "network error"
```

With CORS:
```
Browser → S3: "Can I PUT a file here?"
S3 → Browser: "Access-Control-Allow-Origin: http://localhost:3000" ✅
Browser: "Allowed!" → Upload succeeds
```

## Additional Checks

### Check if CORS is Set
```bash
aws s3api get-bucket-cors --bucket solar-lead-gen --region ap-southeast-2
```

### Test Upload Manually
```javascript
// Open browser console on http://localhost:3000
const testUpload = async () => {
  const response = await fetch('/api/installer/uploads/presign?filename=test.pdf&contentType=application/pdf&fileType=document');
  const data = await response.json();
  console.log('Presigned URL:', data.uploadUrl);
  
  const uploadResponse = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: new Blob(['test'], { type: 'application/pdf' }),
    headers: { 'Content-Type': 'application/pdf' }
  });
  
  console.log('Upload result:', uploadResponse.status, uploadResponse.statusText);
};
testUpload();
```

If you see CORS error in console, that confirms the issue.

## Prevention

Add CORS configuration to all S3 buckets used for browser uploads during bucket creation.

## Verification Checklist

- [ ] CORS rules added to S3 bucket
- [ ] AllowedMethods includes "PUT"
- [ ] AllowedOrigins includes your frontend URL
- [ ] Browser cache cleared
- [ ] File upload tested and works
- [ ] Success message appears
- [ ] File key stored in form state
