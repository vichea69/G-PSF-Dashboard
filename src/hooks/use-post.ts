'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type PostQueryParams = {
  page?: number;
  pageSize?: number;
  q?: string;
};

type PostListResponse = {
  success?: boolean;
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  data?: unknown;
};

async function fetchPosts(
  params: PostQueryParams = {}
): Promise<PostListResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const q = (params.q ?? '').trim();
  const endpoint = q ? '/posts/search' : '/posts';
  const res = await api.get(endpoint, {
    params: {
      page,
      pageSize,
      limit: pageSize,
      ...(q ? { q } : {})
    }
  });
  return res.data;
}

export function usePost(params: PostQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const q = (params.q ?? '').trim();

  return useQuery({
    queryKey: ['posts', page, pageSize, q],
    queryFn: () => fetchPosts({ page, pageSize, q })
  });
}
