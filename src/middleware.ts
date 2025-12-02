import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If no token and trying to access protected route, redirect to login
    if (!token && (path.startsWith('/therapist') || path.startsWith('/client'))) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check role-based access
    if (token) {
      const role = token.role as string

      // Therapist trying to access client routes
      if (path.startsWith('/client') && role === 'THERAPIST') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Client trying to access therapist routes
      if (path.startsWith('/therapist') && role === 'CLIENT') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes - always allow
        if (
          path.startsWith('/api/auth') ||
          path === '/login' ||
          path === '/register' ||
          path === '/unauthorized' ||
          path === '/' ||
          path.startsWith('/_next') ||
          path.startsWith('/favicon')
        ) {
          return true
        }

        // Protected routes - require authentication
        if (path.startsWith('/therapist') || path.startsWith('/client')) {
          return !!token
        }

        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
