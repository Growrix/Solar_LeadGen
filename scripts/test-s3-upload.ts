/**
 * S3 Upload Test Script
 * Tests the complete upload flow to identify issues
 */

// Load environment variables
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { getPresignedUploadUrl, s3Client } from '../src/lib/s3';
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

async function testS3Upload() {
  console.log('🔍 Testing S3 Upload Infrastructure\n');
  
  // Test 1: Check S3 client configuration
  console.log('Test 1: S3 Client Configuration');
  console.log('================================');
  console.log(`Region: ${process.env.AWS_REGION}`);
  console.log(`Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`Access Key ID: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log('✅ S3 client configured\n');

  // Test 2: Check CORS configuration
  console.log('Test 2: S3 Bucket CORS Configuration');
  console.log('====================================');
  try {
    const corsCommand = new GetBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
    });
    
    const corsResponse = await s3Client.send(corsCommand);
    console.log('Current CORS rules:');
    console.log(JSON.stringify(corsResponse.CORSRules, null, 2));
    
    // Check if CORS allows PUT from localhost
    const hasValidCors = corsResponse.CORSRules?.some(rule => 
      rule.AllowedMethods?.includes('PUT') &&
      (rule.AllowedOrigins?.includes('*') || 
       rule.AllowedOrigins?.includes('http://localhost:3000'))
    );
    
    if (hasValidCors) {
      console.log('✅ CORS configured correctly for uploads\n');
    } else {
      console.log('❌ CORS may not be configured correctly!');
      console.log('   Required: AllowedMethods=["PUT"] and AllowedOrigins=["*" or "http://localhost:3000"]\n');
    }
  } catch (error: any) {
    if (error.name === 'NoSuchCORSConfiguration') {
      console.log('❌ No CORS configuration found!');
      console.log('   This is likely the issue - S3 bucket needs CORS rules\n');
      
      console.log('Attempting to set CORS configuration...');
      await setupCORS();
    } else {
      console.log('❌ Error checking CORS:', error.message);
    }
  }

  // Test 3: Generate presigned URL
  console.log('Test 3: Generate Presigned Upload URL');
  console.log('======================================');
  try {
    const testKey = `test-uploads/test-${Date.now()}.pdf`;
    const presignedUrl = await getPresignedUploadUrl(
      testKey,
      'application/pdf',
      300
    );
    
    console.log('✅ Presigned URL generated successfully');
    console.log(`   URL: ${presignedUrl.substring(0, 80)}...`);
    console.log(`   Key: ${testKey}\n`);

    // Test 4: Actually upload a test file
    console.log('Test 4: Upload Test File to S3');
    console.log('================================');
    const testContent = Buffer.from('This is a test PDF upload');
    
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: testContent,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    
    console.log(`Upload status: ${uploadResponse.status} ${uploadResponse.statusText}`);
    
    if (uploadResponse.ok) {
      console.log('✅ Test upload successful!\n');
      console.log('🎉 S3 upload infrastructure is working correctly!');
    } else {
      console.log('❌ Upload failed!');
      const errorText = await uploadResponse.text();
      console.log('   Error:', errorText);
      
      if (uploadResponse.status === 403) {
        console.log('\n   💡 403 Forbidden - Check:');
        console.log('      1. S3 bucket CORS configuration');
        console.log('      2. S3 bucket policy');
        console.log('      3. IAM user permissions');
      }
    }
  } catch (error: any) {
    console.log('❌ Error during test:', error.message);
  }
}

async function setupCORS() {
  try {
    const corsCommand = new PutBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ['http://localhost:3000', 'https://*.vercel.app'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    });
    
    await s3Client.send(corsCommand);
    console.log('✅ CORS configuration set successfully!\n');
  } catch (error: any) {
    console.log('❌ Failed to set CORS:', error.message);
    console.log('   You may need to set CORS manually in AWS Console\n');
  }
}

// Run the test
testS3Upload().catch(console.error);
