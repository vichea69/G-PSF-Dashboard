'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { SiteSetting } from '../type/site-setting';

export function pickFirstSiteSetting(payload: unknown): SiteSetting | null {
  if (Array.isArray(payload)) {
    const [first] = payload;
    return (first as SiteSetting) ?? null;
  }

  if (payload && typeof payload === 'object' && payload !== null) {
    return payload as SiteSetting;
  }

  return null;
}

export const useSiteSetting = () => {
  return useQuery<SiteSetting | null>({
    queryKey: ['site-setting'],
    queryFn: async () => {
      const response = await api.get('/site-settings');
      return pickFirstSiteSetting(response?.data?.data);
    }
  });
};
