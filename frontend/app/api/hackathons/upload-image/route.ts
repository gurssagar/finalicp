import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToTebi } from '@/lib/tebi-s3-upload'

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const hackathonId = formData.get('hackathonId') as string

    console.log('=== Hackathon Image Upload Request ===')
    console.log('Hackathon ID:', hackathonId)
    console.log('File:', file?.name || 'null')

    // Validate inputs
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
        code: 'NO_FILE'
      }, { status: 400 })
    }

    if (!hackathonId) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon ID is required',
        code: 'NO_HACKATHON_ID'
      }, { status: 400 })
    }

    // Upload image with special folder for hackathons
    const uploadResult = await uploadImageToTebi(file, `hackathons/${hackathonId}`, 2)

    if (!uploadResult.success) {
      console.error('Hackathon image upload failed:', uploadResult.error)
      return NextResponse.json({
        success: false,
        error: uploadResult.error,
        code: 'UPLOAD_FAILED'
      }, { status: 500 })
    }

    console.log('Hackathon image upload successful:', uploadResult.url)

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      hackathonId: hackathonId
    })

  } catch (error) {
    console.error('Critical error in hackathon image upload:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      code: 'CRITICAL_ERROR'
    }, { status: 500 })
  }
}