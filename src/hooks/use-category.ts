'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function extractCategoryRows(payload: unknown): any[] {
  const raw = payload as any;

  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;

  return [];
}

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
