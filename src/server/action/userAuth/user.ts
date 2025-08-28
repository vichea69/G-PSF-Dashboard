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
    httpOnly: false, // middleware reads it; backend may also set httpOnly cookie
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
  // Call backend. Many backends expect { user: { email, password } }
  const { data } = await api.post('/login', { user: input });

  const payload: any = data;
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
    // Prefer longer-lived window for UX if refresh TTL provided
    const maxAge =
      meta?.refreshTokenExpiresIn ??
      meta?.accessTokenExpiresIn ??
      60 * 60 * 24 * 7;
    await setCookie('access_token', accessToken, { maxAge });
  }

  // Optionally mirror refresh token for client flows (non-httpOnly)
  if (tokens?.refreshToken && meta?.refreshTokenExpiresIn) {
    await setCookie('refresh_token', tokens.refreshToken, {
      maxAge: meta.refreshTokenExpiresIn
    });
  }

  // Revalidate key pages where auth state matters
  revalidatePath('/admin/overview');
  revalidatePath('/');

  const result: LoginResult = { user, tokens, meta };
  return result;
}

export async function logoutAction() {
  try {
    await api.post('/logout', {}, { withCredentials: true });
  } catch {
    // Swallow network errors; proceed to clear cookies
  }
  await deleteCookie('access_token');
  await deleteCookie('refresh_token');
  revalidatePath('/');
  revalidatePath('/admin/overview');
  redirect('/auth/sign-in');
}
