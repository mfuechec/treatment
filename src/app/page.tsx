"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Redirect based on role
      if (session.user.role === "THERAPIST") {
        router.push("/therapist/dashboard")
      } else if (session.user.role === "CLIENT") {
        router.push("/client/dashboard")
      }
    }
  }, [status, session, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="animate-pulse text-lg text-teal-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4 py-12">
      <main className="flex w-full max-w-5xl flex-col items-center gap-12 text-center">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Tava</h1>
          </div>
          <p className="text-xl font-medium text-teal-700">
            Treatment Plan Generator
          </p>
        </div>

        {/* Tagline */}
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">
            AI-Powered Treatment Planning for Mental Health Professionals
          </h2>
          <p className="text-lg leading-relaxed text-gray-600">
            Transform your therapy sessions into comprehensive, evidence-based
            treatment plans. Tava combines your clinical expertise with advanced
            AI to streamline documentation and enhance patient care.
          </p>
        </div>

        {/* Features */}
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
              <svg
                className="h-6 w-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Smart Analysis
            </h3>
            <p className="text-sm text-gray-600">
              AI-assisted session analysis that identifies themes, concerns, and
              treatment goals from your clinical notes
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
              <svg
                className="h-6 w-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Clinical Control
            </h3>
            <p className="text-sm text-gray-600">
              You maintain full control over all treatment decisions with easy
              review and editing capabilities
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              HIPAA Compliant
            </h3>
            <p className="text-sm text-gray-600">
              Enterprise-grade security and privacy protection for all patient
              information and clinical data
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:from-teal-600 hover:to-cyan-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border-2 border-teal-600 bg-white px-8 py-3 text-lg font-semibold text-teal-600 transition-all hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500">
          Designed for licensed mental health professionals
        </p>
      </main>
    </div>
  )
}
