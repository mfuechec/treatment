import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Compare therapist impressions with AI analysis
 * Computes alignment matching between them
 */
interface ComparisonItem {
  therapist?: any
  ai?: any
  alignment: 'aligned' | 'ai_only' | 'therapist_only' | 'conflict'
}

interface ComparisonResult {
  concerns: ComparisonItem[]
  themes: ComparisonItem[]
  goals: ComparisonItem[]
  strengths: ComparisonItem[]
  interventions: any[]
  homework: any[]
  riskAssessment: {
    therapist: any
    ai: any[]
    alignment: string
  }
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate text similarity (simple Jaccard similarity)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1).split(' '))
  const words2 = new Set(normalizeText(text2).split(' '))

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

/**
 * Compare arrays of text items (concerns, themes, goals, strengths)
 */
function compareTextArrays(
  therapistItems: any[],
  aiItems: any[],
  textField: string = 'text',
  threshold: number = 0.5
): ComparisonItem[] {
  const results: ComparisonItem[] = []
  const matchedAiIndices = new Set<number>()

  // Compare each therapist item with AI items
  for (const therapistItem of therapistItems) {
    const therapistText =
      typeof therapistItem === 'string' ? therapistItem : therapistItem[textField]

    let bestMatch = -1
    let bestSimilarity = 0

    // Find best matching AI item
    aiItems.forEach((aiItem, index) => {
      if (matchedAiIndices.has(index)) return

      const aiText = typeof aiItem === 'string' ? aiItem : aiItem[textField]
      const similarity = calculateSimilarity(therapistText, aiText)

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity
        bestMatch = index
      }
    })

    if (bestSimilarity >= threshold && bestMatch !== -1) {
      // Aligned: both therapist and AI identified similar item
      results.push({
        therapist: therapistItem,
        ai: aiItems[bestMatch],
        alignment: 'aligned',
      })
      matchedAiIndices.add(bestMatch)
    } else {
      // Therapist only: AI didn't identify this
      results.push({
        therapist: therapistItem,
        alignment: 'therapist_only',
      })
    }
  }

  // Add remaining AI items that weren't matched
  aiItems.forEach((aiItem, index) => {
    if (!matchedAiIndices.has(index)) {
      results.push({
        ai: aiItem,
        alignment: 'ai_only',
      })
    }
  })

  return results
}

/**
 * Compare themes (simple string arrays)
 */
function compareThemes(
  therapistThemes: string[],
  aiThemes: string[]
): ComparisonItem[] {
  return compareTextArrays(therapistThemes, aiThemes, '', 0.6)
}

/**
 * Compare risk assessments
 */
function compareRisks(therapistRisks: any, aiRisks: any[]) {
  const therapistLevel = therapistRisks.level || 'NONE'
  const hasHighAiRisk = aiRisks.some((r) => r.severity === 'HIGH')
  const hasModerateAiRisk = aiRisks.some((r) => r.severity === 'MODERATE')

  let alignment = 'aligned'

  if (therapistLevel === 'NONE' && aiRisks.length > 0) {
    alignment = 'ai_detected_risk'
  } else if (therapistLevel !== 'NONE' && aiRisks.length === 0) {
    alignment = 'therapist_detected_risk'
  } else if (therapistLevel === 'HIGH' && !hasHighAiRisk) {
    alignment = 'severity_mismatch'
  } else if (therapistLevel === 'MODERATE' && !hasModerateAiRisk && !hasHighAiRisk) {
    alignment = 'severity_mismatch'
  }

  return {
    therapist: therapistRisks,
    ai: aiRisks,
    alignment,
  }
}

/**
 * GET /api/sessions/[id]/compare
 * Get comparison between therapist impressions and AI analysis
 *
 * Returns:
 * - Both sets of data side-by-side
 * - Alignment indicators (aligned, ai_only, therapist_only)
 * - Similarity scores where applicable
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/sessions/[id]/compare">
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

    // Fetch session with impressions and AI analysis
    const sessionData = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
        status: true,
        impressions: true,
        aiAnalysis: true,
        riskFlags: {
          orderBy: {
            severity: 'desc',
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

    // Ensure both impressions and AI analysis exist
    if (!sessionData.impressions) {
      return NextResponse.json(
        { error: 'No therapist impressions found for this session' },
        { status: 404 }
      )
    }

    if (!sessionData.aiAnalysis) {
      return NextResponse.json(
        { error: 'No AI analysis found for this session' },
        { status: 404 }
      )
    }

    // Extract data from Prisma Json types
    const impressions = sessionData.impressions
    const aiAnalysis = sessionData.aiAnalysis

    const therapistConcerns = Array.isArray(impressions.concerns)
      ? impressions.concerns
      : []
    const therapistThemes = Array.isArray(impressions.themes)
      ? (impressions.themes as string[])
      : []
    const therapistGoals = Array.isArray(impressions.goals)
      ? impressions.goals
      : []
    const therapistStrengths = Array.isArray(impressions.strengths)
      ? impressions.strengths
      : []

    const aiConcerns = Array.isArray(aiAnalysis.concerns)
      ? aiAnalysis.concerns
      : []
    const aiThemes = Array.isArray(aiAnalysis.themes) ? (aiAnalysis.themes as string[]) : []
    const aiGoals = Array.isArray(aiAnalysis.goals) ? aiAnalysis.goals : []
    const aiStrengths = Array.isArray(aiAnalysis.strengths)
      ? aiAnalysis.strengths
      : []
    const aiInterventions = Array.isArray(aiAnalysis.interventions)
      ? aiAnalysis.interventions
      : []
    const aiHomework = Array.isArray(aiAnalysis.homework)
      ? aiAnalysis.homework
      : []
    const aiRiskIndicators = Array.isArray(aiAnalysis.riskIndicators)
      ? aiAnalysis.riskIndicators
      : []

    // Perform comparisons
    const comparison: ComparisonResult = {
      concerns: compareTextArrays(therapistConcerns, aiConcerns, 'text', 0.5),
      themes: compareThemes(therapistThemes, aiThemes),
      goals: compareTextArrays(therapistGoals, aiGoals, 'text', 0.5),
      strengths: compareTextArrays(therapistStrengths, aiStrengths, 'text', 0.5),
      interventions: aiInterventions, // AI-only (therapist doesn't provide these)
      homework: aiHomework, // AI-only
      riskAssessment: compareRisks(
        impressions.riskObservations,
        aiRiskIndicators
      ),
    }

    // Calculate summary statistics
    const stats = {
      concerns: {
        aligned: comparison.concerns.filter((c) => c.alignment === 'aligned').length,
        aiOnly: comparison.concerns.filter((c) => c.alignment === 'ai_only').length,
        therapistOnly: comparison.concerns.filter((c) => c.alignment === 'therapist_only')
          .length,
      },
      themes: {
        aligned: comparison.themes.filter((t) => t.alignment === 'aligned').length,
        aiOnly: comparison.themes.filter((t) => t.alignment === 'ai_only').length,
        therapistOnly: comparison.themes.filter((t) => t.alignment === 'therapist_only')
          .length,
      },
      goals: {
        aligned: comparison.goals.filter((g) => g.alignment === 'aligned').length,
        aiOnly: comparison.goals.filter((g) => g.alignment === 'ai_only').length,
        therapistOnly: comparison.goals.filter((g) => g.alignment === 'therapist_only')
          .length,
      },
      strengths: {
        aligned: comparison.strengths.filter((s) => s.alignment === 'aligned').length,
        aiOnly: comparison.strengths.filter((s) => s.alignment === 'ai_only').length,
        therapistOnly: comparison.strengths.filter((s) => s.alignment === 'therapist_only')
          .length,
      },
      overallAlignment: 0,
    }

    // Calculate overall alignment percentage
    const totalItems =
      stats.concerns.aligned +
      stats.concerns.aiOnly +
      stats.concerns.therapistOnly +
      stats.themes.aligned +
      stats.themes.aiOnly +
      stats.themes.therapistOnly +
      stats.goals.aligned +
      stats.goals.aiOnly +
      stats.goals.therapistOnly +
      stats.strengths.aligned +
      stats.strengths.aiOnly +
      stats.strengths.therapistOnly

    const alignedItems =
      stats.concerns.aligned +
      stats.themes.aligned +
      stats.goals.aligned +
      stats.strengths.aligned

    stats.overallAlignment =
      totalItems > 0 ? Math.round((alignedItems / totalItems) * 100) : 0

    return NextResponse.json(
      {
        sessionId: id,
        status: sessionData.status,
        comparison,
        stats,
        riskFlags: sessionData.riskFlags,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error comparing session data:', error)
    return NextResponse.json(
      {
        error: 'Failed to compare session data',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
