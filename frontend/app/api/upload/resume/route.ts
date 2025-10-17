import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import AWS from 'aws-sdk';

// Tebi S3 Configuration
const getTebiConfig = () => {
  return {
    accessKeyId: process.env.TEBI_ACCESS_KEY_ID!,
    secretAccessKey: process.env.TEBI_SECRET_ACCESS_KEY!,
    region: process.env.NEXT_PUBLIC_TEBI_REGION || 'us-east-1',
    bucket: process.env.NEXT_PUBLIC_TEBI_BUCKET_NAME!,
    endpoint: process.env.NEXT_PUBLIC_TEBI_ENDPOINT!
  }
}

// Initialize S3 client for Tebi
const getS3Client = () => {
  const tebiConfig = getTebiConfig()

  return new AWS.S3({
    accessKeyId: tebiConfig.accessKeyId,
    secretAccessKey: tebiConfig.secretAccessKey,
    region: tebiConfig.region,
    endpoint: tebiConfig.endpoint,
    s3ForcePathStyle: true, // Required for some S3-compatible services
    signatureVersion: 'v4'
  })
}

async function uploadToTebi(file: File, fileName: string): Promise<{ url: string; key: string }> {
  const tebiConfig = getTebiConfig();

  // Check if Tebi S3 is properly configured
  if (!tebiConfig.accessKeyId || !tebiConfig.secretAccessKey || !tebiConfig.bucket || !tebiConfig.endpoint) {
    console.error('Tebi S3 configuration missing:', {
      accessKeyId: tebiConfig.accessKeyId ? '***configured***' : 'missing',
      secretAccessKey: tebiConfig.secretAccessKey ? '***configured***' : 'missing',
      bucket: tebiConfig.bucket,
      endpoint: tebiConfig.endpoint,
      region: tebiConfig.region
    });

    throw new Error('Tebi S3 is not configured. Please check your environment variables.');
  }

  // Get file content as Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create unique file key
  const fileExtension = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const key = `resumes/${timestamp}-${randomString}.${fileExtension}`;

  try {
    // Prepare upload parameters
    const uploadParams = {
      Bucket: tebiConfig.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read' as const, // Make the file publicly accessible
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    };

    // Upload to Tebi S3
    console.log('Uploading resume to Tebi S3:', { bucket: tebiConfig.bucket, key, fileSize: file.size });
    const s3 = getS3Client();
    const result = await s3.upload(uploadParams).promise();
    console.log('Resume upload successful to Tebi S3');

    // Return the public URL
    const publicUrl = `${tebiConfig.endpoint.replace(/\/$/, '')}/${tebiConfig.bucket}/${key}`;
    console.log('Generated public URL for resume:', publicUrl);

    return {
      url: publicUrl,
      key: key
    };
  } catch (error: any) {
    console.error('Resume upload to Tebi S3 error:', error);
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
      url: uploadResult.url, // Changed from fileUrl to url to match other APIs
      key: uploadResult.key,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch (error) {
    console.error('Resume upload error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}