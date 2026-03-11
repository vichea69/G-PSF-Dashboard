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

export function extractSectionRows(payload: unknown): any[] {
  const raw = payload as any;

  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;

  return [];
}

async function fetchSections(pageId?: string) {
  const response = await api.get('/sections', {
    params: pageId ? { pageId } : undefined,
    headers: getClientAuthHeaders(),
    withCredentials: true
  });

  return response.data;
}

export function useSection(pageId?: number | string) {
  // When a page is selected, the backend returns only the matching sections.
  const normalizedPageId = String(pageId ?? '').trim();

  return useQuery({
    queryKey: ['sections', normalizedPageId || 'all'],
    queryFn: () => fetchSections(normalizedPageId || undefined),
    select: extractSectionRows
  });
}
