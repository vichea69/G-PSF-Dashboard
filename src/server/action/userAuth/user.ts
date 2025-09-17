'use server';
import 'server-only';
import { api } from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { LoginInput, LoginResult } from './types';

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
  options?: { maxAge?: number }
) {
  const c = await cookies();
  const maxAge = options?.maxAge ?? 60 * 60 * 24 * 7; // default 7d
  c.set({
    name,
    value,
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
    maxAge
  });
}

async function deleteCookie(name: string) {
  const c = await cookies();
  c.set({ name, value: '', path: '/', maxAge: 0 });
}

export async function loginAction(input: LoginInput) {
  // Prefer sending only the required fields
  const { email, password, rememberMe } = input;

  // Some backends expect { user: { email, password } }, others { email, password }
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

  if (!user) {
    throw new Error(
      payload?.message ?? 'Invalid response from server during login'
    );
  }

  // Prefer backend-set cookies (httpOnly). If tokens returned, set a readable cookie for middleware.
  const accessToken: string | undefined = user?.token || tokens?.accessToken;
  if (accessToken) {
    // Choose persistence based on rememberMe: session (no maxAge) or persistent (maxAge)
    if (rememberMe) {
      const maxAge =
        meta?.refreshTokenExpiresIn ??
        meta?.accessTokenExpiresIn ??
        60 * 60 * 24 * 7; // default 7 days
      await setCookie('access_token', accessToken, { maxAge });
    } else {
      // Session cookie: expires when browser closes
      await setCookie('access_token', accessToken, {
        maxAge: undefined as any
      });
    }
  }

  // Optionally mirror refresh token for client flows (non-httpOnly)
  if (tokens?.refreshToken && meta?.refreshTokenExpiresIn) {
    if (rememberMe) {
      await setCookie('refresh_token', tokens.refreshToken, {
        maxAge: meta.refreshTokenExpiresIn
      });
    } else {
      // Do not persist refresh token for session-only
    }
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
