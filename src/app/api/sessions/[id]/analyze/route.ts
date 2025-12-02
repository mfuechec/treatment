import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAnalysis } from '@/services/openai'
import { detectRisks } from '@/services/safety'

/**
 * POST /api/sessions/[id]/analyze
 * Trigger AI analysis on a session transcript
 *
 * This endpoint:
 * 1. Validates the session exists and belongs to the therapist
 * 2. Ensures the session is ready for analysis (has transcript and impressions)
 * 3. Runs GPT-4 analysis on the transcript
 * 4. Detects safety risks
 * 5. Stores results in AIAnalysis and RiskFlag tables
 * 6. Updates session status to AI_ANALYZED or COMPARISON_READY
 */
export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]/analyze">
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
        transcript: true,
        status: true,
        aiAnalysis: {
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

    // Check if transcript exists
    if (!sessionData.transcript || sessionData.transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cannot analyze session without transcript' },
        { status: 400 }
      )
    }

    // Check if analysis already exists
    if (sessionData.aiAnalysis) {
      return NextResponse.json(
        { error: 'AI analysis already exists for this session' },
        { status: 409 }
      )
    }

    // Generate AI analysis
    console.log(`Starting AI analysis for session ${id}`)

    let analysisResult
    try {
      analysisResult = await generateAnalysis(sessionData.transcript)
    } catch (error) {
      console.error('Error generating AI analysis:', error)
      return NextResponse.json(
        {
          error: 'Failed to generate AI analysis',
          details: (error as Error).message
        },
        { status: 500 }
      )
    }

    // Detect safety risks
    console.log(`Starting risk detection for session ${id}`)

    let risks
    try {
      risks = await detectRisks(sessionData.transcript)
    } catch (error) {
      console.error('Error detecting risks:', error)
      // Don't fail the entire analysis if risk detection fails
      // Use risks from the analysis as fallback
      risks = analysisResult.riskIndicators || []
    }

    // Store results in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create AI analysis record
      const aiAnalysis = await tx.aIAnalysis.create({
        data: {
          sessionId: id,
          concerns: analysisResult.concerns,
          themes: analysisResult.themes,
          goals: analysisResult.goals,
          interventions: analysisResult.interventions,
          homework: analysisResult.homework,
          strengths: analysisResult.strengths,
          riskIndicators: analysisResult.riskIndicators,
          rawOutput: analysisResult, // Store full response for debugging
        },
      })

      // Create risk flags for detected risks
      const riskFlags = await Promise.all(
        risks.map((risk) =>
          tx.riskFlag.create({
            data: {
              sessionId: id,
              riskType: risk.type,
              severity: risk.severity,
              excerpt: risk.excerpt,
              acknowledged: false,
            },
          })
        )
      )

      // Update session status
      // If impressions exist, move to COMPARISON_READY
      // Otherwise, move to AI_ANALYZED
      const impressions = await tx.therapistImpressions.findUnique({
        where: { sessionId: id },
        select: { id: true },
      })

      const newStatus = impressions ? 'COMPARISON_READY' : 'AI_ANALYZED'

      const updatedSession = await tx.session.update({
        where: { id },
        data: { status: newStatus },
      })

      return {
        aiAnalysis,
        riskFlags,
        session: updatedSession,
      }
    })

    console.log(
      `AI analysis completed for session ${id}. Detected ${risks.length} risk(s).`
    )

    return NextResponse.json(
      {
        message: 'AI analysis completed successfully',
        analysis: result.aiAnalysis,
        riskFlags: result.riskFlags,
        session: {
          id: result.session.id,
          status: result.session.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in analyze endpoint:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze session',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions/[id]/analyze
 * Get existing AI analysis for a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params

    // Verify session exists and belongs to therapist
    const sessionData = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
        aiAnalysis: true,
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

    if (sessionData.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This session does not belong to you.' },
        { status: 403 }
      )
    }

    if (!sessionData.aiAnalysis) {
      return NextResponse.json(
        { error: 'No AI analysis found for this session' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        analysis: sessionData.aiAnalysis,
        riskFlags: sessionData.riskFlags,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching AI analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI analysis' },
      { status: 500 }
    )
  }
}
