import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Validation schema for creating a new client
const createClientSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1, 'Display name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/**
 * GET /api/therapist/clients
 * List all clients for the authenticated therapist
 */
export async function GET() {
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

    const clients = await prisma.client.findMany({
      where: {
        therapistId: session.user.therapistId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        sessions: {
          select: {
            id: true,
            sessionDate: true,
            status: true,
          },
          orderBy: {
            sessionDate: 'desc',
          },
          take: 5, // Include last 5 sessions for each client
        },
        treatmentPlans: {
          select: {
            id: true,
            currentVersionId: true,
            updatedAt: true,
          },
          take: 1,
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            sessions: true,
            treatmentPlans: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: 'desc',
        },
      },
    })

    return NextResponse.json({ clients }, { status: 200 })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/therapist/clients
 * Create/invite a new client (creates User with CLIENT role and Client record linked to therapist)
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
    const validationResult = createClientSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, displayName, password } = validationResult.data

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user and client in a transaction
    const client = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'CLIENT',
        },
      })

      const newClient = await tx.client.create({
        data: {
          userId: user.id,
          therapistId: session.user.therapistId!,
          displayName,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          },
        },
      })

      return newClient
    })

    return NextResponse.json(
      {
        message: 'Client created successfully',
        client
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
