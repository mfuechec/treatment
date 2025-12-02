import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/therapist/clients/[id]
 * Get client details with their sessions and treatment plans
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/therapist/clients/[id]">
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

    // Fetch client and verify ownership
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sessions: {
          include: {
            impressions: true,
            aiAnalysis: true,
            summary: true,
            riskFlags: {
              where: {
                acknowledged: false,
              },
            },
          },
          orderBy: {
            sessionDate: 'desc',
          },
        },
        treatmentPlans: {
          include: {
            versions: {
              orderBy: {
                versionNumber: 'desc',
              },
              take: 1,
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify the client belongs to the authenticated therapist
    if (client.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This client does not belong to you.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ client }, { status: 200 })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client details' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/therapist/clients/[id]
 * Remove client (soft delete or actual delete)
 * This will cascade delete all related data (sessions, treatment plans, etc.)
 */
export async function DELETE(
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

    // Fetch client and verify ownership
    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        therapistId: true,
        userId: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify the client belongs to the authenticated therapist
    if (client.therapistId !== session.user.therapistId) {
      return NextResponse.json(
        { error: 'Forbidden. This client does not belong to you.' },
        { status: 403 }
      )
    }

    // Delete the user (cascade will delete client and all related data)
    await prisma.user.delete({
      where: { id: client.userId },
    })

    return NextResponse.json(
      { message: 'Client deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
