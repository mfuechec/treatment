import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyPlanApproved } from '@/lib/notifications'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/plans/[id]/approve">
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

    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
            therapistId: true,
            userId: true
          }
        },
        versions: {
          where: { id: { equals: id } },
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Treatment plan not found' },
        { status: 404 }
      )
    }

    if (plan.client.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This plan does not belong to your client.' },
        { status: 403 }
      )
    }

    if (!plan.currentVersionId) {
      return NextResponse.json(
        { error: 'No current version found' },
        { status: 400 }
      )
    }

    const currentVersion = await prisma.treatmentPlanVersion.findUnique({
      where: { id: plan.currentVersionId }
    })

    if (!currentVersion) {
      return NextResponse.json(
        { error: 'Current version not found' },
        { status: 404 }
      )
    }

    if (currentVersion.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'This plan is already approved' },
        { status: 400 }
      )
    }

    const therapistContent = currentVersion.therapistContent as any

    const concernsList = Array.isArray(therapistContent.concerns) ? therapistContent.concerns.join('\n') : 'None listed'
    const themesList = Array.isArray(therapistContent.themes) ? therapistContent.themes.join('\n') : 'None listed'
    const goalsList = Array.isArray(therapistContent.goals) ? therapistContent.goals.join('\n') : 'None listed'
    const strengthsList = Array.isArray(therapistContent.strengths) ? therapistContent.strengths.join('\n') : 'None listed'
    const interventionsList = Array.isArray(therapistContent.interventions) ? therapistContent.interventions.map((i: any) => `- ${i.name}: ${i.rationale}`).join('\n') : 'None listed'
    const homeworkList = Array.isArray(therapistContent.homework) ? therapistContent.homework.map((h: any) => `- ${h.task}: ${h.rationale}`).join('\n') : 'None listed'

    const prompt = `You are a mental health professional creating a client-facing summary of a treatment plan.
Your goal is to translate clinical language into warm, accessible, and encouraging language that clients can easily understand.

Here is the clinical treatment plan:

CLINICAL CONCERNS:
${concernsList}

THEMES:
${themesList}

TREATMENT GOALS:
${goalsList}

CLIENT STRENGTHS:
${strengthsList}

RECOMMENDED INTERVENTIONS:
${interventionsList}

HOMEWORK ASSIGNMENTS:
${homeworkList}

Please create a client-facing version that:
1. Uses warm, non-clinical language
2. Focuses on empowerment and hope
3. Explains concepts in accessible terms
4. Maintains all the important content but makes it friendly
5. Organizes the information in a clear, easy-to-read format

Return ONLY a JSON object with this exact structure:
{
  "summary": "A brief, encouraging overview paragraph",
  "goals": ["List of goals in simple language"],
  "strengths": ["List of strengths in encouraging language"],
  "interventions": ["List of interventions explained simply"],
  "homework": ["List of homework in friendly, actionable language"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate mental health professional who translates clinical treatment plans into client-friendly language. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const clientContent = JSON.parse(
      completion.choices[0].message.content || '{}'
    )

    const updatedVersion = await prisma.treatmentPlanVersion.update({
      where: { id: plan.currentVersionId },
      data: {
        status: 'APPROVED',
        clientContent,
        editedAt: new Date()
      }
    })

    const updatedPlan = await prisma.treatmentPlan.update({
      where: { id },
      data: {
        updatedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            displayName: true
          }
        },
        versions: {
          orderBy: {
            versionNumber: 'desc'
          },
          take: 1
        }
      }
    })

    // Notify the client that their treatment plan has been approved
    await notifyPlanApproved(plan.client.userId, id)

    return NextResponse.json(
      {
        message: 'Treatment plan approved successfully',
        plan: updatedPlan,
        clientContent
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error approving treatment plan:', error)
    return NextResponse.json(
      { error: 'Failed to approve treatment plan' },
      { status: 500 }
    )
  }
}
