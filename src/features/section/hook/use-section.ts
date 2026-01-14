'use client';
import { useQuery } from '@tanstack/react-query';
import { baseAPI } from '@/lib/api';

// Function to fetch sections data from the API
async function fetchSections() {
  const res = await fetch(`${baseAPI}/sections`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch sections');
  }
  return res.json();
}
// Custom hook to fetch sections data
export function useSection() {
  return useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections,
    select: (data) => data.data
  });
}
