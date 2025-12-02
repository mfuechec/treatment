"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Tava Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
            <svg
              className="h-12 w-12 text-white"
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
        </div>

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Something Went Wrong
        </h1>

        {/* Error Description */}
        <p className="mb-2 text-lg text-gray-700">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        {/* Technical Details (in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 mt-4 rounded-lg bg-red-50 p-4 text-left">
            <p className="mb-2 text-xs font-semibold text-red-900">
              Development Error Details:
            </p>
            <code className="block overflow-auto text-xs text-red-800">
              {error.message}
            </code>
            {error.digest && (
              <p className="mt-2 text-xs text-red-700">
                Error Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <p className="mb-8 text-sm text-gray-600">
          Try refreshing the page or return to a safe location.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
          >
            Go Back
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-12 rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Need immediate assistance?
          </p>
          <p className="text-xs text-gray-500">
            If this error persists, please contact support with the error details.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-400">
              Reference ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
