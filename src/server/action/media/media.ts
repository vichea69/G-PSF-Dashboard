'use server';

import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

//Fetch Media
export type MediaActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

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
