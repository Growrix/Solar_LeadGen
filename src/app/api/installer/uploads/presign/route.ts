import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPresignedUploadUrl, generateFileKey, isValidFileType, ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES } from '@/lib/s3';
import { z } from 'zod';

const presignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  fileType: z.enum(['document', 'logo']), // document = license/abn, logo = company logo
});

// GET /api/installer/uploads/presign
// Generate presigned URL for direct S3 upload
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Forbidden - Installer access only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType');
    const fileType = searchParams.get('fileType');

    // Validate query params
    const validated = presignRequestSchema.parse({
      filename,
      contentType,
      fileType,
    });

    // Validate content type based on file type
    let allowedTypes: string[];
    let prefix: string;

    if (validated.fileType === 'logo') {
      allowedTypes = ALLOWED_IMAGE_TYPES;
      prefix = 'logos';
    } else {
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
      prefix = 'documents';
    }

    if (!isValidFileType(validated.contentType, allowedTypes)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Generate unique S3 key
    const key = generateFileKey(user.id, validated.filename, prefix);

    // Generate presigned upload URL (valid for 5 minutes)
    const uploadUrl = await getPresignedUploadUrl(key, validated.contentType, 300);

    return NextResponse.json({
      success: true,
      uploadUrl,
      key, // Return key so frontend can store it after successful upload
      expiresIn: 300, // seconds
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[GET /api/installer/uploads/presign] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
