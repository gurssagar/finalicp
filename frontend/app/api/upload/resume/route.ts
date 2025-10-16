import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Tebi.io S3 Configuration
const s3Client = new S3Client({
  endpoint: 'https://s3.tebi.io',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.TEBI_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.TEBI_BUCKET_NAME;

async function uploadToTebi(file: File, fileName: string): Promise<{ url: string; key: string }> {
  if (!process.env.TEBI_ACCESS_KEY_ID || !process.env.TEBI_SECRET_ACCESS_KEY || !BUCKET_NAME) {
    throw new Error('Tebi.io credentials not configured. Please check environment variables.');
  }

  // Get file content as Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create unique file key
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileKey = `resumes/${timestamp}-${randomString}-${fileName}`;

  try {
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    const putResponse = await s3Client.send(putCommand);
    console.log('S3 upload successful:', { ETag: putResponse.ETag });

    // Return the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.tebi.io/${fileKey}`;

    return {
      url: publicUrl,
      key: fileKey
    };
  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      Code: error.Code,
      RequestId: error.RequestId,
    });
    throw new Error(`Failed to upload file to Tebi.io storage: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    // Validate file type - only PDF allowed
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Only PDF files are allowed',
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size must be less than 10MB',
      }, { status: 400 });
    }

    // Upload to Tebi.io
    const uploadResult = await uploadToTebi(file, file.name);

    // Here you would typically save the file URL to your database
    // For now, we'll just return the upload result
    console.log('Resume uploaded successfully:', uploadResult);

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      fileUrl: uploadResult.url,
      fileName: file.name,
      fileSize: file.size,
      fileKey: uploadResult.key,
    });

  } catch (error) {
    console.error('Resume upload error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}