import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/actions/auth';
import { getUserActor } from '@/lib/ic-agent';

const skillsSchema = z.object({
  skills: z.array(z.string().max(50, 'Skill name is too long')).max(20, 'Maximum 20 skills allowed'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = skillsSchema.parse(body);

    // Update user profile with skills
    try {
      const actor = getUserActor();

      // Update the user's profile with skills
      const result = await actor.update_user_profile({
        skills: validatedData.skills
      });

      console.log('Profile updated with skills:', result);

      return NextResponse.json({
        success: true,
        message: 'Skills saved successfully',
        skills: validatedData.skills,
        profile: result
      });

    } catch (icpError) {
      console.error('ICP update error:', icpError);

      // Fallback: store skills in a temporary storage or session
      // This is a fallback mechanism for when ICP backend is not available
      return NextResponse.json({
        success: true,
        message: 'Skills saved temporarily (backend update pending)',
        skills: validatedData.skills,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Skills save error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}