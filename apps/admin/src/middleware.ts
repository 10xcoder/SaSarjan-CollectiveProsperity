import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // For now, we'll handle auth checks in the layout component
  // This middleware will be enhanced once we verify the auth setup
  
  // Allow all auth routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // The actual auth check happens in the dashboard layout
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}