import { NextRequest, NextResponse } from 'next/server'
import AWS from 'aws-sdk'

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
  success: boolean
  url?: string
  key?: string
  error?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('=== Upload Request Started ===')

  try {
    const tebiConfig = getTebiConfig()

    // Check if Tebi S3 is properly configured
    if (!tebiConfig.accessKeyId || !tebiConfig.secretAccessKey || !tebiConfig.bucket || !tebiConfig.endpoint) {
      console.error('Tebi S3 configuration missing:', {
        accessKeyId: tebiConfig.accessKeyId ? '***configured***' : 'missing',
        secretAccessKey: tebiConfig.secretAccessKey ? '***configured***' : 'missing',
        bucket: tebiConfig.bucket,
        endpoint: tebiConfig.endpoint,
        region: tebiConfig.region
      })

      return NextResponse.json({
        success: false,
        error: 'Tebi S3 is not configured. Please contact support.',
        code: 'CONFIG_ERROR'
      }, { status: 500 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'portfolio'
    const attempt = formData.get('attempt') as string || '1'

    console.log('Upload request details:', {
      fileName: file?.name || 'null',
      fileSize: file?.size || 0,
      fileType: file?.type || 'null',
      folder,
      attempt
    })

    // Validate file
    if (!file) {
      console.error('No file provided in form data')
      return NextResponse.json({
        success: false,
        error: 'No file provided',
        code: 'NO_FILE'
      }, { status: 400 })
    }

    // Enhanced validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      console.error('Invalid file type:', {
        fileType: file.type,
        fileExtension,
        fileName: file.name
      })
      return NextResponse.json({
        success: false,
        error: `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP images are allowed.`,
        code: 'INVALID_FILE_TYPE'
      }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      console.error('File too large:', {
        size: file.size,
        maxSize,
        fileName: file.name
      })
      return NextResponse.json({
        success: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`,
        code: 'FILE_TOO_LARGE'
      }, { status: 400 })
    }

    // Check minimum file size
    if (file.size < 1024) {
      console.error('File too small:', {
        size: file.size,
        fileName: file.name
      })
      return NextResponse.json({
        success: false,
        error: 'File too small. Minimum size is 1KB.',
        code: 'FILE_TOO_SMALL'
      }, { status: 400 })
    }

    // Generate unique file key with better naming
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').substring(0, 50)
    const key = `${folder}/${timestamp}-${randomString}-${cleanFileName}`

    console.log('Generated file key:', key)

    // Convert File to Buffer for AWS SDK v2
    const fileBuffer = await file.arrayBuffer()

    // Prepare upload parameters
    const uploadParams = {
      Bucket: tebiConfig.bucket,
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      ACL: 'public-read' as const,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
        uploadAttempt: attempt,
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }

    console.log('Starting S3 upload:', {
      bucket: tebiConfig.bucket,
      key,
      fileSize: file.size,
      contentType: file.type
    })

    // Upload to Tebi S3 with timeout
    const s3 = getS3Client()
    const result = await Promise.race([
      s3.upload(uploadParams).promise(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 60000) // 60 second timeout
      )
    ]) as any

    console.log('S3 upload successful:', {
      location: result.Location,
      etag: result.ETag
    })

    // Return the public URL
    const publicUrl = `${tebiConfig.endpoint.replace(/\/$/, '')}/${tebiConfig.bucket}/${key}`
    console.log('Generated public URL:', publicUrl)

    const duration = Date.now() - startTime
    console.log(`=== Upload Completed Successfully in ${duration}ms ===`)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      duration: duration
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`=== Upload Failed after ${duration}ms ===`, error)

    // Categorize errors for better client handling
    let errorMessage = error instanceof Error ? error.message : 'Upload failed'
    let errorCode = 'UPLOAD_ERROR'

    if (errorMessage.includes('timeout')) {
      errorCode = 'TIMEOUT_ERROR'
      errorMessage = 'Upload timed out. Please try again with a smaller file or better connection.'
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      errorCode = 'NETWORK_ERROR'
      errorMessage = 'Network error. Please check your connection and try again.'
    } else if (errorMessage.includes('Access Denied') || errorMessage.includes('credentials')) {
      errorCode = 'AUTH_ERROR'
      errorMessage = 'Authentication error. Please contact support.'
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode,
      duration: duration
    }, { status: 500 })
  }
}
