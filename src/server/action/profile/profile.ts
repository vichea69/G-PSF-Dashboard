//update profile
'use server';
import { api } from '@/lib/api';
import { getAuthHeaders } from '../userAuth/user';

export async function updateProfile(id: number, payload: any) {
  const headers = await getAuthHeaders();
  return api.put(`/users/${id}`, payload, { headers });
}
