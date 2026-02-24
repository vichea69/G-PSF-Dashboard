import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mapMediaFolder,
  mapMediaItem,
  type MediaApiResponse,
  type MediaListResult
} from '@/features/media/types/media-type';
import {
  deleteMedia,
  getMedia,
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
  const result = await getMedia({ page, pageSize, folderId });
  if (!result.success) {
    throw new Error(result.error || 'Failed to load media');
  }

  const response = (result.data ?? {}) as MediaApiResponse;
  const raw = response.data;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  const mapped = items.map(mapMediaItem);
  const folders = Array.isArray(response.folders)
    ? response.folders.map(mapMediaFolder)
    : [];
  const currentFolder =
    response.folder && typeof response.folder === 'object'
      ? mapMediaFolder(response.folder)
      : null;
  const total =
    typeof response.total === 'number' ? response.total : mapped.length;
  const normalizedPage =
    typeof response.page === 'number' ? response.page : page;
  const normalizedPageSize =
    typeof response.pageSize === 'number' ? response.pageSize : pageSize;

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

  const result = await deleteMedia(trimmedId);
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete media');
  }

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
