import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas for impression data structures
// Using lowercase values for consistency across API and frontend
const concernSchema = z.object({
  text: z.string().min(1, 'Concern text is required'),
  severity: z.enum(['low', 'moderate', 'high']),
  excerptIds: z.array(z.string()).optional(),
})

const highlightSchema = z.object({
  excerpt: z.string().min(1, 'Highlight excerpt is required'),
  timestamp: z.string().optional(),
  note: z.string().optional(),
})

const goalSchema = z.object({
  text: z.string().min(1, 'Goal text is required'),
  timeline: z.string().optional(),
  excerptIds: z.array(z.string()).optional(),
})

const diagnosisSchema = z.object({
  code: z.string().min(1, 'Diagnosis code is required'),
  description: z.string().min(1, 'Diagnosis description is required'),
})

const riskObservationSchema = z.object({
  level: z.enum(['none', 'low', 'moderate', 'high']),
  notes: z.string().optional(),
  excerptIds: z.array(z.string()).optional(),
})

const strengthSchema = z.object({
  text: z.string().min(1, 'Strength text is required'),
  excerptIds: z.array(z.string()).optional(),
})

const sessionQualitySchema = z.object({
  rapport: z.number().min(1).max(5).optional(),
  engagement: z.number().min(1).max(5).optional(),
  resistance: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
})

// Validation schema for creating/updating impressions
const impressionsSchema = z.object({
  concerns: z.array(concernSchema),
  highlights: z.array(highlightSchema),
  themes: z.array(z.string()),
  goals: z.array(goalSchema),
  diagnoses: z.array(diagnosisSchema).optional(),
  modalities: z.array(z.string()).optional(),
  riskObservations: riskObservationSchema,
  strengths: z.array(strengthSchema),
  sessionQuality: sessionQualitySchema.optional(),
})

/**
 * GET /api/sessions/[id]/impressions
 * Get impressions for a session
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]/impressions">
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

    // Verify session exists and belongs to therapist
    const sessionData = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
      },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (sessionData.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This session does not belong to you.' },
        { status: 403 }
      )
    }

    // Fetch impressions
    const impressions = await prisma.therapistImpressions.findUnique({
      where: { sessionId: id },
    })

    if (!impressions) {
      return NextResponse.json(
        { error: 'Impressions not found for this session' },
        { status: 404 }
      )
    }

    return NextResponse.json({ impressions }, { status: 200 })
  } catch (error) {
    console.error('Error fetching impressions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch impressions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions/[id]/impressions
 * Save therapist impressions for a session
 */
export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]/impressions">
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
    const validationResult = impressionsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const impressionsData = validationResult.data

    // Verify session exists and belongs to therapist
    const sessionData = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
        impressions: {
          select: {
            id: true,
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

    if (sessionData.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This session does not belong to you.' },
        { status: 403 }
      )
    }

    // Check if impressions already exist
    if (sessionData.impressions) {
      return NextResponse.json(
        { error: 'Impressions already exist for this session. Use PUT to update.' },
        { status: 409 }
      )
    }

    // Create impressions and update session status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newImpressions = await tx.therapistImpressions.create({
        data: {
          sessionId: id,
          concerns: impressionsData.concerns,
          highlights: impressionsData.highlights,
          themes: impressionsData.themes,
          goals: impressionsData.goals,
          diagnoses: impressionsData.diagnoses || undefined,
          modalities: impressionsData.modalities || undefined,
          riskObservations: impressionsData.riskObservations,
          strengths: impressionsData.strengths,
          sessionQuality: impressionsData.sessionQuality || undefined,
        },
      })

      const updatedSession = await tx.session.update({
        where: { id },
        data: {
          status: 'IMPRESSIONS_COMPLETE',
        },
      })

      return { impressions: newImpressions, session: updatedSession }
    })

    return NextResponse.json(
      {
        message: 'Impressions saved successfully',
        ...result,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating impressions:', error)
    return NextResponse.json(
      { error: 'Failed to save impressions' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sessions/[id]/impressions
 * Update existing impressions
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]/impressions">
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
    const validationResult = impressionsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const impressionsData = validationResult.data

    // Verify session exists and belongs to therapist
    const sessionData = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
        impressions: {
          select: {
            id: true,
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

    if (sessionData.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This session does not belong to you.' },
        { status: 403 }
      )
    }

    // Check if impressions exist
    if (!sessionData.impressions) {
      return NextResponse.json(
        { error: 'No impressions found for this session. Use POST to create.' },
        { status: 404 }
      )
    }

    // Update impressions
    const updatedImpressions = await prisma.therapistImpressions.update({
      where: { sessionId: id },
      data: {
        concerns: impressionsData.concerns,
        highlights: impressionsData.highlights,
        themes: impressionsData.themes,
        goals: impressionsData.goals,
        diagnoses: impressionsData.diagnoses || undefined,
        modalities: impressionsData.modalities || undefined,
        riskObservations: impressionsData.riskObservations,
        strengths: impressionsData.strengths,
        sessionQuality: impressionsData.sessionQuality || undefined,
      },
    })

    return NextResponse.json(
      {
        message: 'Impressions updated successfully',
        impressions: updatedImpressions,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating impressions:', error)
    return NextResponse.json(
      { error: 'Failed to update impressions' },
      { status: 500 }
    )
  }
}
