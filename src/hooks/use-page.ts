'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

async function fetchPages() {
  const res = await api.get('/pages');
  console.log(res.data);
  return res.data;
}

export function usePage() {
  // Backwards-compatible name, now returns the full query object
  return useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages
  });
}
