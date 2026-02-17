import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mapMediaFolder,
  mapMediaItem,
  type MediaApiResponse,
  type MediaListResult
} from '@/features/media/types/media-type';
import {
  createMediaFolder,
  deleteMediaFolder
} from '@/server/action/media/media';

type MediaQueryParams = {
  page?: number;
  pageSize?: number;
  folderId?: string | null;
};

async function fetchMedia(
  params: MediaQueryParams = {}
): Promise<MediaListResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const folderId =
    typeof params.folderId === 'string' && params.folderId.trim()
      ? params.folderId.trim()
      : null;
  const endpoint = folderId
    ? `/media/folders/${encodeURIComponent(folderId)}`
    : '/media';

  const response = await api.get<MediaApiResponse>(endpoint, {
    params: { page, pageSize }
  });
  const raw = response.data?.data;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  const mapped = items.map(mapMediaItem);
  const folders = Array.isArray(response.data?.folders)
    ? response.data.folders.map(mapMediaFolder)
    : [];
  const currentFolder =
    response.data?.folder && typeof response.data.folder === 'object'
      ? mapMediaFolder(response.data.folder)
      : null;
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
    folders,
    currentFolder,
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

type CreateFolderInput = {
  name: string;
};

async function createFolder({ name }: CreateFolderInput) {
  const result = await createMediaFolder(name);

  if (!result.success) {
    throw new Error(result.error || 'Failed to create folder');
  }

  return result.data;
}

type DeleteFolderInput = {
  id: string | number;
  force?: boolean;
};

async function deleteFolder({ id, force }: DeleteFolderInput) {
  const result = await deleteMediaFolder(id, { force });

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete folder');
  }

  return result.data;
}

export function useMedia(params: MediaQueryParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const folderId =
    typeof params.folderId === 'string' && params.folderId.trim()
      ? params.folderId.trim()
      : null;

  return useQuery<MediaListResult>({
    queryKey: ['media', folderId ?? 'root', page, pageSize],
    queryFn: () => fetchMedia({ page, pageSize, folderId })
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

export function useCreateMediaFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useDeleteMediaFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}
