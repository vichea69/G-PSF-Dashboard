import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mapMediaItem,
  type MediaApiResponse,
  type MediaListResult
} from '@/features/media/types/media-type';

type MediaQueryParams = {
  page?: number;
  pageSize?: number;
};

async function fetchMedia(
  params: MediaQueryParams = {}
): Promise<MediaListResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const response = await api.get<MediaApiResponse>('/media', {
    params: { page, pageSize }
  });
  const raw = response.data?.data;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  const mapped = items.map(mapMediaItem);
  const total =
    typeof response.data?.total === 'number'
      ? response.data.total
      : mapped.length;
  const normalizedPage =
    typeof response.data?.page === 'number' ? response.data.page : page;
  const normalizedPageSize =
    typeof response.data?.pageSize === 'number'
      ? response.data.pageSize
      : pageSize;

  return {
    items: mapped,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    total
  };
}

async function deleteMediaItem(id: string | number) {
  const trimmedId = String(id ?? '').trim();
  if (!trimmedId) {
    throw new Error('Media id is required');
  }

  await api.delete(`/media/${encodeURIComponent(trimmedId)}`);
  return true;
}

type ReplaceMediaInput = {
  id: string | number;
  formData: FormData;
};

async function replaceMediaItem({ id, formData }: ReplaceMediaInput) {
  const trimmedId = String(id ?? '').trim();
  if (!trimmedId) {
    throw new Error('Media id is required');
  }

  await api.put(`/media/${encodeURIComponent(trimmedId)}/replace`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
  });
  return true;
}

export function useMedia(params: MediaQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  return useQuery<MediaListResult>({
    queryKey: ['media', page, pageSize],
    queryFn: () => fetchMedia({ page, pageSize })
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMediaItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useReplaceMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceMediaItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}
