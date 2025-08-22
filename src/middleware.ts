import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function middleware(req: NextRequest) {
  // Get token from cookies
  let token = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  // If no access token but refresh token exists, attempt silent refresh
  if (!token && refreshToken) {
    try {
      const { data } = await api.post('/refresh', { refreshToken });
      const nextAccess = data?.accessToken ?? data?.data?.accessToken;
      if (nextAccess) {
        token = nextAccess;
        const res = NextResponse.next();
        // set new access cookie for subsequent requests
        res.cookies.set('access_token', nextAccess, {
          path: '/',
          httpOnly: false,
          sameSite: 'lax'
        });
        return res;
      }
    } catch {}
  }

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
