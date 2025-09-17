//update profile
'use server';
import { api } from '@/lib/api';
import { getAuthHeaders } from '../userAuth/user';

export async function updateProfile(payload: any) {
  const authHeaders = await getAuthHeaders();
  const clean = Object.fromEntries(
    Object.entries(payload ?? {}).filter(([, v]) => v !== undefined)
  );
  // Debug: log fields being sent (omit token)
  console.log('[updateProfile] sending fields:', Object.keys(clean));
  const body = JSON.stringify(clean);
  const { data } = await api.put(`/user`, body, {
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json'
    }
  });
  return data;
}
