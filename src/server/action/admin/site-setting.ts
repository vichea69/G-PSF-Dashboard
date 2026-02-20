'use server';

import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

export async function UpdateSiteSetting(payload: FormData) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.put('/site-settings/current', payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: any) {
    const detail = error?.response?.data;
    const message =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      error?.message ||
      'Failed to update site setting.';
    throw new Error(message);
  }
}
