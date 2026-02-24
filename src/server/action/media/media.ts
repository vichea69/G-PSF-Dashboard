'use server';

import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

//Fetch Media using server action and tankstack
export type MediaActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type GetMediaOptions = {
  page?: number;
  pageSize?: number;
  folderId?: string | null;
};

export async function getMedia(
  options: GetMediaOptions = {}
): Promise<MediaActionResult> {
  const headers = await getAuthHeaders();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;
  const folderId =
    typeof options.folderId === 'string' && options.folderId.trim()
      ? options.folderId.trim()
      : null;
  const endpoint = folderId
    ? `/media/folders/${encodeURIComponent(folderId)}`
    : '/media';

  try {
    const res = await api.get(endpoint, {
      headers,
      withCredentials: true,
      params: { page, pageSize }
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return {
      success: false,
      error: message ?? 'Failed to load media'
    };
  }
}

export async function uploadMedia(
  formData: FormData
): Promise<MediaActionResult> {
  const headers = await getAuthHeaders();

  try {
    const res = await api.post('/media/upload', formData, {
      headers,
      withCredentials: true
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return {
      success: false,
      error: message ?? 'Failed to upload media'
    };
  }
}

export async function deleteMedia(
  id: string | number
): Promise<MediaActionResult> {
  const mediaId = String(id ?? '').trim();

  if (!mediaId) {
    return { success: false, error: 'Media id is required' };
  }

  const headers = await getAuthHeaders();
  const url = `/media/${encodeURIComponent(mediaId)}`;

  try {
    const res = await api.delete(url, {
      headers,
      withCredentials: true
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return {
      success: false,
      error: message ?? 'Failed to delete media'
    };
  }
}

export async function replaceMedia(
  id: string | number,
  formData: FormData
): Promise<MediaActionResult> {
  const mediaId = String(id ?? '').trim();

  if (!mediaId) {
    return { success: false, error: 'Media id is required' };
  }

  const headers = await getAuthHeaders();
  const url = `/media/${encodeURIComponent(mediaId)}/replace`;

  try {
    const res = await api.put(url, formData, {
      headers,
      withCredentials: true
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return {
      success: false,
      error: message ?? 'Failed to replace media'
    };
  }
}

export async function createMediaFolder(
  name: string
): Promise<MediaActionResult> {
  const folderName = String(name ?? '').trim();

  if (!folderName) {
    return { success: false, error: 'Folder name is required' };
  }

  const headers = await getAuthHeaders();

  try {
    const res = await api.post(
      '/media/folders',
      { name: folderName },
      {
        headers,
        withCredentials: true
      }
    );

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return {
      success: false,
      error: message ?? 'Failed to create folder'
    };
  }
}

type DeleteMediaFolderOptions = {
  force?: boolean;
};

export async function deleteMediaFolder(
  id: string | number,
  options: DeleteMediaFolderOptions = {}
): Promise<MediaActionResult> {
  const folderId = String(id ?? '').trim();

  if (!folderId) {
    return { success: false, error: 'Folder id is required' };
  }

  const headers = await getAuthHeaders();
  const force = options.force === true;
  const url = `/media/folders/${encodeURIComponent(folderId)}`;

  try {
    const res = await api.delete(url, {
      headers,
      withCredentials: true,
      params: force ? { force: true } : undefined
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return {
      success: false,
      error: message ?? 'Failed to delete folder'
    };
  }
}
