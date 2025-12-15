import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mapMediaItem,
  type MediaApiResponse,
  type MediaFile
} from '@/features/media/types/media-type';

async function fetchMedia(): Promise<MediaFile[]> {
  const response = await api.get<MediaApiResponse>('/media');
  const items = response.data?.data?.items ?? [];
  return items.map(mapMediaItem);
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

export function useMedia() {
  return useQuery<MediaFile[]>({
    queryKey: ['media'],
    queryFn: fetchMedia
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
