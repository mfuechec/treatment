import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notifySessionUploaded } from '@/lib/notifications'

// Validation schema for creating a new session
const createSessionSchema = z.object({
  clientId: z.string().cuid(),
  sessionDate: z.string().datetime(),
  transcript: z.string().min(1, 'Transcript is required'),
})

/**
 * GET /api/sessions
 * List sessions (filtered by therapist or client based on role)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    // Build where clause based on user role
    let whereClause: any = {}

    if (session.user.role === 'THERAPIST') {
      if (!session.user.therapistId) {
        return NextResponse.json(
          { error: 'Therapist profile not found.' },
          { status: 404 }
        )
      }

      whereClause.therapistId = session.user.therapistId

      // Optionally filter by specific client
      if (clientId) {
        // Verify the client belongs to this therapist
        const client = await prisma.client.findFirst({
          where: {
            id: clientId,
            therapistId: session.user.therapistId,
          },
        })

        if (!client) {
          return NextResponse.json(
            { error: 'Client not found or does not belong to you' },
            { status: 404 }
          )
        }

        whereClause.clientId = clientId
      }
    } else if (session.user.role === 'CLIENT') {
      if (!session.user.clientId) {
        return NextResponse.json(
          { error: 'Client profile not found.' },
          { status: 404 }
        )
      }

      whereClause.clientId = session.user.clientId
    }

    // Optionally filter by status
    if (status) {
      whereClause.status = status
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
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
        impressions: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        aiAnalysis: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        summary: true,
        riskFlags: {
          where: {
            acknowledged: false,
          },
        },
        _count: {
          select: {
            riskFlags: true,
          },
        },
      },
      orderBy: {
        sessionDate: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ sessions }, { status: 200 })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * Create a new session with transcript
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Validate request body
    const validationResult = createSessionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { clientId, sessionDate, transcript } = validationResult.data

    // Verify the client belongs to this therapist
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        therapistId: session.user.therapistId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Create the session
    const newSession = await prisma.session.create({
      data: {
        clientId,
        therapistId: session.user.therapistId,
        sessionDate: new Date(sessionDate),
        transcript,
        status: 'TRANSCRIPT_UPLOADED',
      },
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    // Send notification to the therapist
    await notifySessionUploaded(
      session.user.id,
      newSession.client.displayName,
      newSession.id
    )

    return NextResponse.json(
      {
        message: 'Session created successfully',
        session: newSession,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
