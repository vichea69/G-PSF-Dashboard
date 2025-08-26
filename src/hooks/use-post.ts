'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

async function fetchPosts() {
  const res = await api.get('/posts');
  return res.data;
}

export function usePost() {
  // Backwards-compatible name, now returns the full query object
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });
}
