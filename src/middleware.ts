import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Get token from cookies
  const token = req.cookies.get('access_token')?.value;

  // If user is not logged in and tries to access dashboard → redirect
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/auth/sign-in', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and tries to go to login page → redirect to dashboard
  if (token && req.nextUrl.pathname.startsWith('/auth/sign-in')) {
    const dashboardUrl = new URL('/dashboard/overview', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', // protect dashboard
    '/auth/:path*' // handle auth redirection
  ]
};
