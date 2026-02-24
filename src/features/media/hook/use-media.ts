import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mapMediaFolder,
  mapMediaItem,
  type MediaApiResponse,
  type MediaListResult
} from '@/features/media/types/media-type';

type MediaQueryParams = {
  page?: number;
  pageSize?: number;
  folderId?: string | null;
};

function getClientAuthHeaders(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const accessTokenCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('access_token='));
  const encodedToken = accessTokenCookie?.split('=').slice(1).join('=');
  const token = encodedToken ? decodeURIComponent(encodedToken) : '';

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as any)?.response?.data;
  return (
    detail?.message ||
    detail?.error ||
    (typeof detail === 'string' ? detail : undefined) ||
    (error as Error)?.message ||
    fallback
  );
}

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
    params: { page, pageSize },
    headers: getClientAuthHeaders(),
    withCredentials: true
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

  try {
    await api.delete(`/media/${encodeURIComponent(trimmedId)}`, {
      headers: getClientAuthHeaders(),
      withCredentials: true
    });
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete media'));
  }

  return true;
}

type CreateFolderInput = {
  name: string;
};

async function createFolder({ name }: CreateFolderInput) {
  const folderName = String(name ?? '').trim();
  if (!folderName) {
    throw new Error('Folder name is required');
  }

  try {
    const response = await api.post(
      '/media/folders',
      { name: folderName },
      {
        headers: getClientAuthHeaders(),
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to create folder'));
  }
}

type DeleteFolderInput = {
  id: string | number;
  force?: boolean;
};

async function deleteFolder({ id, force }: DeleteFolderInput) {
  const folderId = String(id ?? '').trim();
  if (!folderId) {
    throw new Error('Folder id is required');
  }

  try {
    const response = await api.delete(
      `/media/folders/${encodeURIComponent(folderId)}`,
      {
        headers: getClientAuthHeaders(),
        withCredentials: true,
        params: force ? { force: true } : undefined
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete folder'));
  }
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
