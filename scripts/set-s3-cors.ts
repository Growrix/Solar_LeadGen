/**
 * Set S3 Bucket CORS Configuration
 * Fixes "network error" when uploading files from browser
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'solar-lead-gen';

async function setCORS() {
  console.log('🔧 Setting S3 Bucket CORS Configuration\n');
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Region: ${process.env.AWS_REGION}\n`);

  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://*.vercel.app',
        ],
        ExposeHeaders: ['ETag', 'x-amz-request-id'],
        MaxAgeSeconds: 3000,
      },
    ],
  };

  try {
    // Check current CORS
    console.log('📋 Checking current CORS configuration...');
    try {
      const getCurrentCors = new GetBucketCorsCommand({
        Bucket: BUCKET_NAME,
      });
      const currentCors = await s3Client.send(getCurrentCors);
      console.log('Current CORS:');
      console.log(JSON.stringify(currentCors.CORSRules, null, 2));
      console.log('');
    } catch (error: any) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('⚠️  No CORS configuration found (this is the problem!)\n');
      } else {
        console.log(`⚠️  Could not check current CORS: ${error.message}\n`);
      }
    }

    // Set new CORS
    console.log('🚀 Setting new CORS configuration...');
    console.log(JSON.stringify(corsConfiguration, null, 2));
    console.log('');

    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);

    console.log('✅ CORS configuration set successfully!\n');
    console.log('🎉 File uploads from browser should now work!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Refresh your browser (Ctrl+Shift+R)');
    console.log('2. Try uploading a file in the Verification Modal');
    console.log('3. You should see "Uploaded successfully" ✅');
  } catch (error: any) {
    console.error('❌ Failed to set CORS configuration:', error);
    console.log('');
    console.log('Possible reasons:');
    console.log('1. AWS credentials do not have s3:PutBucketCors permission');
    console.log('2. Bucket name is incorrect');
    console.log('3. Bucket is in a different region');
    console.log('');
    console.log('Manual fix via AWS Console:');
    console.log(`1. Go to: https://s3.console.aws.amazon.com/s3/buckets/${BUCKET_NAME}?region=${process.env.AWS_REGION}&tab=permissions`);
    console.log('2. Click "Permissions" → Scroll to "Cross-origin resource sharing (CORS)"');
    console.log('3. Click "Edit" → Paste the JSON from above → Save');
  }
}

setCORS();
