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

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
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

      return NextResponse.json({
        success: false,
        error: 'Tebi S3 is not configured. Please check your environment variables.'
      }, { status: 500 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Check file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only images are allowed.'
      }, { status: 400 });
    }

    // Check file size (max 5MB for profile images)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // Generate unique file key for profile images
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const key = `profile-images/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to Buffer for AWS SDK v2
    const fileBuffer = await file.arrayBuffer();

    // Prepare upload parameters
    const uploadParams = {
      Bucket: tebiConfig.bucket,
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      ACL: 'public-read' as const, // Make the file publicly accessible
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        userId: session.userId
      }
    };

    // Upload to Tebi S3
    console.log('Uploading profile image to Tebi S3:', { bucket: tebiConfig.bucket, key, fileSize: file.size });
    const s3 = getS3Client();
    const result = await s3.upload(uploadParams).promise();
    console.log('Profile image upload successful to Tebi S3');

    // Return the public URL
    const publicUrl = `${tebiConfig.endpoint.replace(/\/$/, '')}/${tebiConfig.bucket}/${key}`;
    console.log('Generated public URL for profile image:', publicUrl);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      key: key
    });

  } catch (error) {
    console.error('Error uploading profile image to Tebi S3:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}
