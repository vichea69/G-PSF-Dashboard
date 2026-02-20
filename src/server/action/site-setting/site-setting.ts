'use server';
import 'server-only';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

//Create Site Setting
export async function CreateSiteSetting(formData: FormData) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.post('/site-settings', formData, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    throw new Error(message ?? 'Failed to create site setting');
  }
}

//Update Site Setting
export async function UpdateSiteSetting(data: FormData) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.put('/site-settings/current', data, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    throw new Error(message ?? 'Failed to update site setting');
  }
}
