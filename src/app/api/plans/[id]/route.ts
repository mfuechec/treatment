import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/plans/[id]">
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

    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
            therapistId: true
          }
        },
        versions: {
          orderBy: {
            versionNumber: 'desc'
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Treatment plan not found' },
        { status: 404 }
      )
    }

    if (session.user.role === 'THERAPIST') {
      if (!session.user.therapistId || plan.client.therapistId !== session.user.therapistId) {
        return NextResponse.json(
          { error: 'Forbidden. This plan does not belong to your client.' },
          { status: 403 }
        )
      }
    } else if (session.user.role === 'CLIENT') {
      if (!session.user.clientId || plan.clientId !== session.user.clientId) {
        return NextResponse.json(
          { error: 'Forbidden. This plan does not belong to you.' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ plan }, { status: 200 })
  } catch (error) {
    console.error('Error fetching treatment plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatment plan' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/plans/[id]">
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
    const { therapistContent } = body

    if (!therapistContent || typeof therapistContent !== 'object') {
      return NextResponse.json(
        { error: 'therapistContent object is required' },
        { status: 400 }
      )
    }

    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            therapistId: true
          }
        },
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

    // Update the current version - reset to DRAFT and clear client content
    const updatedVersion = await prisma.treatmentPlanVersion.update({
      where: { id: plan.currentVersionId },
      data: {
        therapistContent,
        status: 'DRAFT',
        clientContent: undefined,
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
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: 'Treatment plan updated successfully',
        plan: updatedPlan
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating treatment plan:', error)
    return NextResponse.json(
      { error: 'Failed to update treatment plan' },
      { status: 500 }
    )
  }
}
