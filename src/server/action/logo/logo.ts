// Logo actions (read-only)
'use server';
import 'server-only';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

// CRUD types and actions removed

async function getAuthHeadersSafe() {
  try {
    return await getAuthHeaders();
  } catch {
    if (typeof window !== 'undefined') {
      // Fallback: read token from client cookies (non-httpOnly)
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access_token='))
        ?.split('=')[1];
      return token
        ? { Authorization: `Bearer ${decodeURIComponent(token)}` }
        : {};
    }
    return {};
  }
}

// create/update/delete removed to make the feature read-only

export async function getLogos() {
  const headers = await getAuthHeadersSafe();
  const res = await api.get('/logo', { headers, withCredentials: true });
  return res.data;
}

export async function getLogoById(id: string | number) {
  const headers = await getAuthHeadersSafe();
  const res = await api.get(`/logo/${encodeURIComponent(String(id))}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}
