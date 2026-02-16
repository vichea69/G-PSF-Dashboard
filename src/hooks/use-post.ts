'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type PostQueryParams = {
  page?: number;
  pageSize?: number;
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
  const res = await api.get('/posts', {
    params: { page, pageSize }
  });
  return res.data;
}

export function usePost(params: PostQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  return useQuery({
    queryKey: ['posts', page, pageSize],
    queryFn: () => fetchPosts({ page, pageSize })
  });
}
