import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a session
const updateSessionSchema = z.object({
  transcript: z.string().min(1).optional(),
  sessionDate: z.string().datetime().optional(),
})

/**
 * GET /api/sessions/[id]
 * Get session details with impressions and analysis if available
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]">
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Fetch session
    const sessionData = await prisma.session.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
            therapistId: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        therapist: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        impressions: true,
        aiAnalysis: true,
        summary: true,
        riskFlags: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Verify ownership based on role
    if (session.user.role === 'THERAPIST') {
      if (!session.user.therapistId || sessionData.therapistId !== session.user.therapistId) {
        return NextResponse.json(
          { error: 'Forbidden. This session does not belong to you.' },
          { status: 403 }
        )
      }
    } else if (session.user.role === 'CLIENT') {
      if (!session.user.clientId || sessionData.clientId !== session.user.clientId) {
        return NextResponse.json(
          { error: 'Forbidden. This session does not belong to you.' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ session: sessionData }, { status: 200 })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sessions/[id]
 * Update session (transcript, sessionDate)
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]">
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: 'Unauthorized. Therapist access required.' },
        { status: 401 }
      )
    }

    if (!session.user.therapistId) {
      return NextResponse.json(
        { error: 'Therapist profile not found.' },
        { status: 404 }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate request body
    const validationResult = updateSessionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { transcript, sessionDate } = validationResult.data

    // Check if session exists and belongs to therapist
    const existingSession = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (existingSession.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This session does not belong to you.' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (transcript !== undefined) {
      updateData.transcript = transcript
    }
    if (sessionDate !== undefined) {
      updateData.sessionDate = new Date(sessionDate)
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Session updated successfully',
        session: updatedSession,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sessions/[id]
 * Delete session
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]">
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: 'Unauthorized. Therapist access required.' },
        { status: 401 }
      )
    }

    if (!session.user.therapistId) {
      return NextResponse.json(
        { error: 'Therapist profile not found.' },
        { status: 404 }
      )
    }

    const { id } = await context.params

    // Check if session exists and belongs to therapist
    const existingSession = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (existingSession.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This session does not belong to you.' },
        { status: 403 }
      )
    }

    // Delete session (cascade will delete related impressions, analysis, etc.)
    await prisma.session.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
