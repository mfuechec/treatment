import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPlanSchema = z.object({
  sessionId: z.string(),
  clientId: z.string(),
  status: z.enum(['DRAFT', 'APPROVED']).default('DRAFT'),
  content: z.object({
    concerns: z.array(z.string()),
    themes: z.array(z.string()),
    goals: z.array(z.string()),
    strengths: z.array(z.string()),
    interventions: z.array(
      z.object({
        name: z.string(),
        rationale: z.string()
      })
    ),
    homework: z.array(
      z.object({
        task: z.string(),
        rationale: z.string()
      })
    )
  })
})

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

    let whereClause: any = {}

    if (session.user.role === 'THERAPIST') {
      if (!session.user.therapistId) {
        return NextResponse.json(
          { error: 'Therapist profile not found.' },
          { status: 404 }
        )
      }

      whereClause.client = {
        therapistId: session.user.therapistId
      }

      if (clientId) {
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

    const plans = await prisma.treatmentPlan.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            displayName: true
          }
        },
        versions: {
          where: status ? { status: status as any } : undefined,
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ plans }, { status: 200 })
  } catch (error) {
    console.error('Error fetching treatment plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatment plans' },
      { status: 500 }
    )
  }
}

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

    const validationResult = createPlanSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { sessionId, clientId, status, content } = validationResult.data

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, therapistId: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    if (client.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This client does not belong to you.' },
        { status: 403 }
      )
    }

    const sessionData = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, therapistId: true, clientId: true }
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

    let existingPlan = await prisma.treatmentPlan.findFirst({
      where: { clientId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    })

    let plan
    let version

    if (existingPlan) {
      const nextVersion = (existingPlan.versions[0]?.versionNumber || 0) + 1

      version = await prisma.treatmentPlanVersion.create({
        data: {
          treatmentPlanId: existingPlan.id,
          versionNumber: nextVersion,
          sourceSessionId: sessionId,
          therapistContent: content,
          status
        }
      })

      plan = await prisma.treatmentPlan.update({
        where: { id: existingPlan.id },
        data: {
          currentVersionId: version.id,
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
            where: { id: version.id }
          }
        }
      })
    } else {
      plan = await prisma.treatmentPlan.create({
        data: {
          clientId,
          versions: {
            create: {
              versionNumber: 1,
              sourceSessionId: sessionId,
              therapistContent: content,
              status
            }
          }
        },
        include: {
          client: {
            select: {
              id: true,
              displayName: true
            }
          },
          versions: true
        }
      })

      await prisma.treatmentPlan.update({
        where: { id: plan.id },
        data: {
          currentVersionId: plan.versions[0].id
        }
      })
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'PLAN_MERGED'
      }
    })

    return NextResponse.json(
      {
        message: 'Treatment plan created successfully',
        plan
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating treatment plan:', error)
    return NextResponse.json(
      { error: 'Failed to create treatment plan' },
      { status: 500 }
    )
  }
}
