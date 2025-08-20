'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

async function fetchCategories() {
  const res = await api.get('/categories');
  return res.data;
}

export function useCategory() {
  // Backwards-compatible name, now returns the full query object
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
}

export function useCategories() {
  return useCategory();
}
