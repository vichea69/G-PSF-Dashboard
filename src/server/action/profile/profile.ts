//update profile
'use server';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';
import { getAuthHeaders } from '../userAuth/user';

type ProfileUpdatePayload = {
  username?: string;
  email?: string;
  bio?: string | null;
  image?: string | null;
  password?: string;
};

function getProfileErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data as any;
    const message =
      detail?.message ||
      detail?.error?.details ||
      detail?.error?.message ||
      detail?.error ||
      error.message;

    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Failed to update profile';
}

export async function updateProfile(payload: ProfileUpdatePayload) {
  const authHeaders = await getAuthHeaders();
  const clean = Object.fromEntries(
    Object.entries(payload ?? {}).filter(([, v]) => v !== undefined)
  );

  const body = { user: clean };

  try {
    const { data } = await api.put('/users/me', body, {
      headers: authHeaders,
      withCredentials: true
    });
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status !== 404) {
      throw new Error(getProfileErrorMessage(error));
    }

    try {
      const { data } = await api.put('/user', body, {
        headers: authHeaders,
        withCredentials: true
      });
      return data;
    } catch (fallbackError: unknown) {
      throw new Error(getProfileErrorMessage(fallbackError));
    }
  }
}
