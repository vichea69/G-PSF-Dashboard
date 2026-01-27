'use client';

import { useQuery } from '@tanstack/react-query';
import { baseAPI } from '@/lib/api';

// Function to fetch site setting data from the API
async function getSiteSetting() {
  const res = await fetch(`${baseAPI}/site-settings`, {
    cache: 'no-store',
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch site setting');
  }
  return res.json();
}
// Custom hook to fetch site setting data
export function useSiteSetting() {
  return useQuery({
    queryKey: ['site-setting'],
    queryFn: getSiteSetting,
    select: (data) => data.data[0]
  });
}
