"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4">
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

        {/* 404 Display */}
        <div className="mb-6">
          <h1 className="mb-2 text-8xl font-bold text-gradient">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
        </div>

        {/* Description */}
        <p className="mb-8 text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 space-y-2">
          <p className="text-sm font-medium text-gray-700">Need help?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-teal-600 hover:text-teal-700 hover:underline"
            >
              Sign In
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/register"
              className="text-teal-600 hover:text-teal-700 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 flex justify-center opacity-50">
          <svg
            className="h-32 w-32 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
