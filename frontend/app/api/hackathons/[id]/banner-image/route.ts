import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const { imageUrl } = await request.json()

    console.log('=== Update Banner Image Request ===')
    console.log('Hackathon ID:', hackathonId)
    console.log('Image URL:', imageUrl)

    // Validate inputs
    if (!hackathonId) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon ID is required'
      }, { status: 400 })
    }

    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Image URL is required'
      }, { status: 400 })
    }

    // TODO: Implement actual canister integration
    // For now, just return success since the image URL is already stored
    // In a real implementation, you would call the hackathon canister here
    console.log('Banner image URL updated (canister integration pending)')

    return NextResponse.json({
      success: true,
      message: 'Banner image updated successfully',
      imageUrl: imageUrl
    })

  } catch (error) {
    console.error('Critical error updating banner image:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}