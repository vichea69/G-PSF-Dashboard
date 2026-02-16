'use server';
import 'server-only';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { LoginInput, LoginResult, ResetPassword } from './types';

const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const DEFAULT_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const isProduction = process.env.NODE_ENV === 'production';

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return undefined;
}

function toCookieMaxAge(value: unknown, fallback: number) {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return fallback;
  if (parsed <= 0) return fallback;

  // Some APIs return milliseconds while cookies expect seconds.
  const secondsLikeValue = parsed > 31_536_000 ? parsed / 1000 : parsed;
  return Math.floor(secondsLikeValue);
}

// Exported helper to forward auth in server actions
export async function getAuthHeaders() {
  const c = await cookies();
  const token = c.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to set cookies in a consistent manner
async function setCookie(
  name: string,
  value: string,
  options?: { maxAge?: number; session?: boolean }
) {
  const c = await cookies();
  const cookie = {
    name,
    value,
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
    secure: isProduction
  } as const;

  if (options?.session) {
    c.set(cookie);
    return;
  }

  c.set({
    ...cookie,
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 7 // default 7d
  });
}

async function deleteCookie(name: string) {
  const c = await cookies();
  c.set({ name, value: '', path: '/', maxAge: 0 });
}

export async function loginAction(input: LoginInput) {
  // Prefer sending only the required fields
  const { email, password, rememberMe } = input;

  let payload: any;
  try {
    const res = await api.post('/auth/login', { user: { email, password } });
    payload = res.data;
  } catch (err: any) {
    // Fallback to flat payload if nested failed
    const res = await api.post('/auth/login', { email, password });
    payload = res.data;
  }
  const user = payload?.user ?? payload?.data?.user;
  const tokens = payload?.tokens ?? payload?.data?.tokens;
  const meta = payload?.meta ?? payload?.data?.meta;
  const accessToken = pickString(
    user?.token,
    user?.accessToken,
    user?.access_token,
    tokens?.accessToken,
    tokens?.access_token,
    payload?.accessToken,
    payload?.access_token,
    payload?.data?.accessToken,
    payload?.data?.access_token
  );
  const refreshToken = pickString(
    tokens?.refreshToken,
    tokens?.refresh_token,
    payload?.refreshToken,
    payload?.refresh_token,
    payload?.data?.refreshToken,
    payload?.data?.refresh_token
  );
  const accessTokenMaxAge = toCookieMaxAge(
    meta?.accessTokenExpiresIn ??
      meta?.access_token_expires_in ??
      tokens?.accessTokenExpiresIn ??
      tokens?.access_token_expires_in ??
      payload?.accessTokenExpiresIn ??
      payload?.access_token_expires_in,
    DEFAULT_ACCESS_TOKEN_MAX_AGE
  );
  const refreshTokenMaxAge = toCookieMaxAge(
    meta?.refreshTokenExpiresIn ??
      meta?.refresh_token_expires_in ??
      tokens?.refreshTokenExpiresIn ??
      tokens?.refresh_token_expires_in ??
      payload?.refreshTokenExpiresIn ??
      payload?.refresh_token_expires_in,
    DEFAULT_REFRESH_TOKEN_MAX_AGE
  );

  if (!user) {
    throw new Error(
      payload?.message ?? 'Invalid response from server during login'
    );
  }

  // Prefer backend-set cookies (httpOnly). If tokens returned, set a readable cookie for middleware.
  if (accessToken) {
    if (rememberMe) {
      await setCookie('access_token', accessToken, {
        maxAge: accessTokenMaxAge
      });
    } else {
      // Session cookie: expires when browser closes
      await setCookie('access_token', accessToken, { session: true });
    }
  }

  if (rememberMe && refreshToken) {
    await setCookie('refresh_token', refreshToken, {
      maxAge: refreshTokenMaxAge
    });
  } else {
    // Prevent stale refresh token from previous remember-me login
    await deleteCookie('refresh_token');
  }

  // Revalidate key pages where auth state matters
  revalidatePath('/admin/overview');
  revalidatePath('/');
  const result: LoginResult = { user, tokens, meta };
  return result;
}

export async function logoutAction() {
  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
  } catch {
    // Swallow network errors; proceed to clear cookies
  }
  await deleteCookie('access_token');
  await deleteCookie('refresh_token');
  revalidatePath('/');
  revalidatePath('/admin/overview');
  redirect('/auth/sign-in');
}

export async function forgotPassword({ email }: { email: string }) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' };
  }

  try {
    const res = await api.post('/auth/forgot-password', {
      email: trimmedEmail
    });
    const data = res.data ?? {};

    return {
      success: true,
      message:
        data?.message ??
        data?.data?.message ??
        'Check your email for the reset link'
    };
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as any)?.message ??
        error.message ??
        'Failed to send reset link';
      return { success: false, error: message };
    }

    const message =
      error instanceof Error ? error.message : 'Failed to send reset link';
    return { success: false, error: message };
  }
}

export async function resetPassword({ token, password }: ResetPassword) {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return { success: false, error: 'Reset token is required' };
  }

  try {
    const res = await api.post('/auth/reset-password', {
      token: trimmedToken,
      password
    });
    const data = res.data ?? {};

    return {
      success: true,
      message:
        data?.message ?? data?.data?.message ?? 'Password reset successfully'
    };
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as any)?.message ??
        error.message ??
        'Failed to reset password';
      return { success: false, error: message };
    }

    const message =
      error instanceof Error ? error.message : 'Failed to reset password';
    return { success: false, error: message };
  }
}
