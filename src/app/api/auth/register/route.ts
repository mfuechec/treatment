import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { notifyNewClient } from "@/lib/notifications"

// Validation schemas
const therapistRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("THERAPIST"),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
})

const clientRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("CLIENT"),
  displayName: z.string().min(1, "Display name is required"),
  therapistId: z.string().min(1, "Therapist selection is required"),
})

const registrationSchema = z.union([
  therapistRegistrationSchema,
  clientRegistrationSchema,
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = registrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12)

    // Create user and associated profile in a transaction
    if (validatedData.role === "THERAPIST") {
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          passwordHash,
          role: "THERAPIST",
          therapist: {
            create: {
              licenseNumber: validatedData.licenseNumber || null,
              specialty: validatedData.specialty || null,
            },
          },
        },
        include: {
          therapist: true,
        },
      })

      return NextResponse.json(
        {
          message: "Therapist account created successfully",
          userId: user.id,
        },
        { status: 201 }
      )
    } else {
      // CLIENT registration
      // Verify therapist exists and get their userId
      const therapist = await prisma.therapist.findUnique({
        where: { id: validatedData.therapistId },
        select: { id: true, userId: true }
      })

      if (!therapist) {
        return NextResponse.json(
          { error: "Selected therapist not found" },
          { status: 400 }
        )
      }

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          passwordHash,
          role: "CLIENT",
          client: {
            create: {
              displayName: validatedData.displayName,
              therapistId: validatedData.therapistId,
            },
          },
        },
        include: {
          client: true,
        },
      })

      // Notify the therapist about the new client
      await notifyNewClient(therapist.userId, validatedData.displayName)

      return NextResponse.json(
        {
          message: "Client account created successfully",
          userId: user.id,
        },
        { status: 201 }
      )
    }
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
