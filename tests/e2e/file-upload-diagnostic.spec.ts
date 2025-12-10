/**
 * File Upload Diagnostic Test
 * Identifies exactly where the upload flow is failing
 */

import { test, expect } from '@playwright/test';

test.describe('File Upload Backend Diagnostic', () => {
  test('Check S3 presign endpoint directly', async ({ request }) => {
    console.log('🔍 Testing S3 upload infrastructure...\n');

    // Step 1: Test presign endpoint (requires auth, so this will likely fail with 401)
    console.log('Step 1: Testing /api/installer/uploads/presign endpoint...');
    
    const presignResponse = await request.get(
      'http://localhost:3000/api/installer/uploads/presign?filename=test.pdf&contentType=application/pdf&fileType=document'
    );
    
    console.log(`Response status: ${presignResponse.status()}`);
    console.log(`Response status text: ${presignResponse.statusText()}`);
    
    if (presignResponse.ok()) {
      const body = await presignResponse.json();
      console.log('Response body:', JSON.stringify(body, null, 2));
      console.log('✅ Presign endpoint working!');
      
      // Test if we can actually upload to the presigned URL
      if (body.uploadUrl) {
        console.log('\nStep 2: Testing S3 upload with presigned URL...');
        const testBuffer = Buffer.from('Test PDF content');
        
        const uploadResponse = await request.put(body.uploadUrl, {
          data: testBuffer,
          headers: {
            'Content-Type': 'application/pdf'
          }
        });
        
        console.log(`S3 Upload status: ${uploadResponse.status()}`);
        if (uploadResponse.ok()) {
          console.log('✅ S3 upload successful!');
        } else {
          console.log('❌ S3 upload failed');
          console.log('Response:', await uploadResponse.text());
        }
      }
    } else {
      if (presignResponse.status() === 401) {
        console.log('⚠️ Endpoint requires authentication (expected)');
        console.log('   But endpoint is reachable!');
      } else {
        console.log('❌ Unexpected error');
        const errorBody = await presignResponse.text();
        console.log('Error:', errorBody);
      }
    }
  });

  test('Check S3 environment variables', async ({}) => {
    console.log('🔍 Checking S3 configuration...\n');
    
    // Read .env file
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../../.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      
      const hasAwsRegion = envContent.includes('AWS_REGION=');
      const hasAwsAccessKey = envContent.includes('AWS_ACCESS_KEY_ID=');
      const hasAwsSecretKey = envContent.includes('AWS_SECRET_ACCESS_KEY=');
      const hasAwsBucket = envContent.includes('AWS_S3_BUCKET=');
      
      console.log(`AWS_REGION: ${hasAwsRegion ? '✅ Set' : '❌ Missing'}`);
      console.log(`AWS_ACCESS_KEY_ID: ${hasAwsAccessKey ? '✅ Set' : '❌ Missing'}`);
      console.log(`AWS_SECRET_ACCESS_KEY: ${hasAwsSecretKey ? '✅ Set' : '❌ Missing'}`);
      console.log(`AWS_S3_BUCKET: ${hasAwsBucket ? '✅ Set' : '❌ Missing'}`);
      
      if (hasAwsRegion && hasAwsAccessKey && hasAwsSecretKey && hasAwsBucket) {
        console.log('\n✅ All S3 environment variables are configured!');
      } else {
        console.log('\n❌ Some S3 environment variables are missing!');
      }
    } else {
      console.log('❌ .env file not found!');
    }
  });
});
