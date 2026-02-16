'use server';

import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type { LogoActionResult, LogoItem, LogoPayload } from './logo-type';

export type { LogoPayload };
export type CreateLogoResult = LogoActionResult;

export async function createLogo(
  payload: LogoPayload
): Promise<CreateLogoResult> {
  const headers = await getAuthHeaders();

  try {
    const res = await api.post('/logo', payload, {
      headers,
      withCredentials: true
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    let message = 'Failed to create logo';

    if (isAxiosError(error)) {
      const apiMessage =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message;
      message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : typeof apiMessage === 'string'
          ? apiMessage
          : message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      error: message
    };
  }
}

export async function getLogo(
  id: string | number
): Promise<LogoActionResult<LogoItem>> {
  const trimmedId = String(id ?? '').trim();
  if (!trimmedId) {
    return {
      success: false,
      error: 'Logo id is required'
    };
  }

  const url = `/logo/${encodeURIComponent(trimmedId)}`;
  const headers = await getAuthHeaders();

  try {
    const res = await api.get(url, {
      headers,
      withCredentials: true
    });

    // Backend may return different shapes. Try common paths.
    const raw = res.data as any;
    if (raw?.success === false) {
      const message = raw?.message ?? raw?.error;
      return {
        success: false,
        error: typeof message === 'string' ? message : 'Failed to fetch logo'
      };
    }

    const logo = raw?.data?.logo ?? raw?.data ?? raw?.logo ?? raw ?? null;
    const isValidLogo =
      Boolean(logo) &&
      typeof logo === 'object' &&
      (typeof (logo as any).id === 'number' ||
        typeof (logo as any).id === 'string') &&
      typeof (logo as any).title === 'string' &&
      typeof (logo as any).url === 'string';

    if (!isValidLogo) {
      return {
        success: false,
        error: 'Logo not found'
      };
    }

    return {
      success: true,
      data: logo
    };
  } catch (error: unknown) {
    let message = 'Failed to fetch logo';

    if (isAxiosError(error)) {
      const apiMessage =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message;
      message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : typeof apiMessage === 'string'
          ? apiMessage
          : message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      error: message
    };
  }
}

export async function updateLogo(
  id: string | number,
  payload: Partial<LogoPayload>
): Promise<LogoActionResult> {
  const trimmedId = String(id ?? '').trim();
  if (!trimmedId) {
    return {
      success: false,
      error: 'Logo id is required'
    };
  }

  const url = `/logo/${encodeURIComponent(trimmedId)}`;
  const headers = await getAuthHeaders();

  try {
    const res = await api.put(url, payload, {
      headers,
      withCredentials: true
    });

    return {
      success: true,
      data: res.data
    };
  } catch (error: unknown) {
    let message = 'Failed to update logo';

    if (isAxiosError(error)) {
      const apiMessage =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message;
      message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : typeof apiMessage === 'string'
          ? apiMessage
          : message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      error: message
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

  const url = `/logo/${encodeURIComponent(trimmedId)}`;
  const headers = await getAuthHeaders();

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
    let message = 'Failed to delete logo';

    if (isAxiosError(error)) {
      const apiMessage =
        (error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message;
      message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : typeof apiMessage === 'string'
          ? apiMessage
          : message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      error: message
    };
  }
}
