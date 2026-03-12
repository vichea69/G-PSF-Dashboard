'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type PostQueryParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  pageId?: number | string;
  sectionId?: number | string;
  categoryId?: number | string;
  isFeatured?: boolean | string;
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
  const pageId = String(params.pageId ?? '').trim();
  const sectionId = String(params.sectionId ?? '').trim();
  const categoryId = String(params.categoryId ?? '').trim();
  const isFeatured =
    String(params.isFeatured ?? '')
      .trim()
      .toLowerCase() === 'true';
  const endpoint = categoryId
    ? `/posts/category/${encodeURIComponent(categoryId)}`
    : q
      ? '/posts/search'
      : '/posts';
  const res = await api.get(endpoint, {
    params: {
      page,
      pageSize,
      limit: pageSize,
      ...(q ? { q } : {}),
      ...(pageId ? { pageId } : {}),
      ...(sectionId ? { sectionId } : {}),
      ...(isFeatured ? { isFeatured: true } : {})
    }
  });
  return res.data;
}

export function usePost(params: PostQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const q = (params.q ?? '').trim();
  const pageId = String(params.pageId ?? '').trim();
  const sectionId = String(params.sectionId ?? '').trim();
  const categoryId = String(params.categoryId ?? '').trim();
  const isFeatured =
    String(params.isFeatured ?? '')
      .trim()
      .toLowerCase() === 'true';

  return useQuery({
    queryKey: [
      'posts',
      page,
      pageSize,
      q,
      pageId,
      sectionId,
      categoryId,
      isFeatured
    ],
    queryFn: () =>
      fetchPosts({
        page,
        pageSize,
        q,
        pageId,
        sectionId,
        categoryId,
        isFeatured
      })
  });
}
