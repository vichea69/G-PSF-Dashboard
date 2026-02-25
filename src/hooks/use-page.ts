'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function getClientAuthHeaders(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const accessTokenCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('access_token='));
  const encodedToken = accessTokenCookie?.split('=').slice(1).join('=');
  const token = encodedToken ? decodeURIComponent(encodedToken) : '';

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function extractPageRows(payload: unknown): any[] {
  const raw = payload as any;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  return [];
}

async function fetchPages() {
  const res = await api.get('/pages', {
    headers: getClientAuthHeaders(),
    withCredentials: true
  });
  return res.data;
}

export function usePage() {
  // Backwards-compatible name, now returns the full query object
  return useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages
  });
}
