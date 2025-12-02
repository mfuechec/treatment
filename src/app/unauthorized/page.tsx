"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Unauthorized() {
  const { data: session } = useSession()
  const router = useRouter()

  const getDashboardLink = () => {
    if (!session?.user) {
      return "/login"
    }
    if (session.user.role === "THERAPIST") {
      return "/therapist/dashboard"
    }
    if (session.user.role === "CLIENT") {
      return "/client/dashboard"
    }
    return "/login"
  }

  const getDashboardText = () => {
    if (!session?.user) {
      return "Sign In"
    }
    if (session.user.role === "THERAPIST") {
      return "Go to Therapist Dashboard"
    }
    if (session.user.role === "CLIENT") {
      return "Go to Client Dashboard"
    }
    return "Sign In"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Access Denied
        </h1>

        <p className="mb-2 text-lg text-gray-700">
          You do not have permission to access this page.
        </p>

        <p className="mb-8 text-sm text-gray-600">
          {session?.user
            ? "This page is restricted to a different user role. Please navigate to your appropriate dashboard."
            : "Please sign in to access this resource."}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={getDashboardLink()}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            {getDashboardText()}
          </Link>

          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Go Back
          </button>

          <Link
            href="/"
            className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
          >
            Return to Home
          </Link>
        </div>

        {session?.user && (
          <div className="mt-8 rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">
              Logged in as:{" "}
              <span className="font-medium text-gray-700">
                {session.user.email}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Role:{" "}
              <span className="font-medium text-gray-700">
                {session.user.role}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
