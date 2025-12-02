import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        specialty: "asc",
      },
    })

    return NextResponse.json({ therapists })
  } catch (error) {
    console.error("Error fetching therapists:", error)
    return NextResponse.json(
      { error: "Failed to fetch therapists" },
      { status: 500 }
    )
  }
}
