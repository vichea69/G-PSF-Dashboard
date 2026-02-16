import { NextRequest, NextResponse } from 'next/server';

type RefreshApiResponse = {
  accessToken?: string;
  refreshToken?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
  meta?: {
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
  };
  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
    meta?: {
      accessTokenExpiresIn?: number;
      refreshTokenExpiresIn?: number;
    };
  };
};

type RefreshedTokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenMaxAge: number;
  refreshTokenMaxAge: number;
};

const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const DEFAULT_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const TOKEN_EXPIRY_SKEW_SECONDS = 30;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const REFRESH_ENDPOINT = '/auth/refresh';

const apiBaseUrlRaw = process.env.NEXT_PUBLIC_API_URL ?? '';
const apiBaseUrl = apiBaseUrlRaw.endsWith('/')
  ? apiBaseUrlRaw.slice(0, -1)
  : apiBaseUrlRaw;

const AUTH_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: false,
  sameSite: 'lax' as const,
  secure: IS_PRODUCTION
};

function buildApiUrl(path: string): string | null {
  if (!apiBaseUrl) return null;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

function normalizeMaxAge(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
}

function parseTokenExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(
      Math.ceil(base64Payload.length / 4) * 4,
      '='
    );
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isAccessTokenExpired(token: string): boolean {
  const expiresAt = parseTokenExpiry(token);
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  return expiresAt <= now + TOKEN_EXPIRY_SKEW_SECONDS;
}

function mapRefreshResponse(
  payload: RefreshApiResponse
): RefreshedTokens | null {
  const data = payload.data ?? {};
  const tokens = data.tokens ?? payload.tokens ?? {};
  const meta = data.meta ?? payload.meta ?? {};

  const accessToken =
    payload.accessToken ?? data.accessToken ?? tokens.accessToken;

  if (!accessToken) return null;

  const refreshToken =
    payload.refreshToken ?? data.refreshToken ?? tokens.refreshToken;

  return {
    accessToken,
    refreshToken,
    accessTokenMaxAge: normalizeMaxAge(
      meta.accessTokenExpiresIn,
      DEFAULT_ACCESS_TOKEN_MAX_AGE
    ),
    refreshTokenMaxAge: normalizeMaxAge(
      meta.refreshTokenExpiresIn,
      DEFAULT_REFRESH_TOKEN_MAX_AGE
    )
  };
}

async function refreshAccessToken(
  refreshToken: string,
  cookieHeader: string
): Promise<RefreshedTokens | null> {
  const url = buildApiUrl(REFRESH_ENDPOINT);
  if (!url) return null;

  const encodedToken = encodeURIComponent(refreshToken);
  const refreshCookie = `refresh_token=${encodedToken}; refreshToken=${encodedToken}`;
  const combinedCookieHeader = cookieHeader
    ? `${cookieHeader}; ${refreshCookie}`
    : refreshCookie;

  const requestBodies = [
    { refreshToken },
    { refresh_token: refreshToken }
  ] as const;

  for (const body of requestBodies) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: combinedCookieHeader
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        credentials: 'include'
      });

      if (!response.ok) continue;

      const payload = (await response.json()) as RefreshApiResponse;
      const refreshed = mapRefreshResponse(payload);
      if (refreshed) return refreshed;
    } catch {
      // If refresh request fails, middleware will continue with current token state.
    }
  }

  return null;
}

function applyRefreshedCookies(
  response: NextResponse,
  refreshedTokens: RefreshedTokens | null
): NextResponse {
  if (!refreshedTokens) return response;

  response.cookies.set('access_token', refreshedTokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: refreshedTokens.accessTokenMaxAge
  });

  if (refreshedTokens.refreshToken) {
    response.cookies.set('refresh_token', refreshedTokens.refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: refreshedTokens.refreshTokenMaxAge
    });
  }

  return response;
}

export async function middleware(req: NextRequest) {
  let accessToken = req.cookies.get('access_token')?.value;
  const refreshToken =
    req.cookies.get('refresh_token')?.value ??
    req.cookies.get('refreshToken')?.value;

  let refreshedTokens: RefreshedTokens | null = null;

  if (refreshToken && (!accessToken || isAccessTokenExpired(accessToken))) {
    const cookieHeader = req.headers.get('cookie') ?? '';
    refreshedTokens = await refreshAccessToken(refreshToken, cookieHeader);
    if (refreshedTokens?.accessToken) {
      accessToken = refreshedTokens.accessToken;
    }
  }

  const path = req.nextUrl.pathname;

  if (!accessToken && path.startsWith('/admin')) {
    const loginUrl = new URL('/auth/sign-in', req.url);
    return applyRefreshedCookies(
      NextResponse.redirect(loginUrl),
      refreshedTokens
    );
  }

  if (accessToken && path.startsWith('/auth/sign-in')) {
    const dashboardUrl = new URL('/admin/overview', req.url);
    return applyRefreshedCookies(
      NextResponse.redirect(dashboardUrl),
      refreshedTokens
    );
  }

  return applyRefreshedCookies(NextResponse.next(), refreshedTokens);
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*']
};
