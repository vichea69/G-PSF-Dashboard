'use server';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

type LogoActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CreateLogoResult = LogoActionResult;

export async function createLogo(
  formData: FormData
): Promise<CreateLogoResult> {
  const headers = await getAuthHeaders();

  try {
    const res = await api.post('/logo', formData, {
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
      error: message ?? 'Failed to create logo'
    };
  }
}

export async function getLogo<T = unknown>(
  id: string | number
): Promise<LogoActionResult<T>> {
  const trimmedId = String(id ?? '').trim();

  if (!trimmedId) {
    return {
      success: false,
      error: 'Logo id is required'
    };
  }

  const headers = await getAuthHeaders();
  const url = `/logo/${encodeURIComponent(trimmedId)}`;

  try {
    const res = await api.get(url, {
      headers,
      withCredentials: true
    });
    const raw = res.data;
    const data = raw?.data?.logo ?? raw?.data ?? raw?.logo ?? raw ?? undefined;

    return {
      success: true,
      data: data as T
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
      error: message ?? 'Failed to fetch logo'
    };
  }
}

export async function updateLogo(
  id: string | number,
  payload: FormData | Record<string, unknown>
): Promise<LogoActionResult> {
  const trimmedId = String(id ?? '').trim();

  if (!trimmedId) {
    return {
      success: false,
      error: 'Logo id is required'
    };
  }

  const headers = await getAuthHeaders();
  const url = `/logo/${encodeURIComponent(trimmedId)}`;

  try {
    const config = {
      headers,
      withCredentials: true
    } as const;

    const res =
      payload instanceof FormData
        ? await api.put(url, payload, config)
        : await api.put(url, payload, config);

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
      error: message ?? 'Failed to update logo'
    };
  }
}

export async function deleteLogo(
  id: string | number
): Promise<LogoActionResult> {
  const trimmedId = String(id ?? '').trim();

  if (!trimmedId) {
    return {
      success: false,
      error: 'Logo id is required'
    };
  }

  const headers = await getAuthHeaders();
  const url = `/logo/${encodeURIComponent(trimmedId)}`;

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
      error: message ?? 'Failed to delete logo'
    };
  }
}
