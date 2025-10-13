'use server';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

// Delete role and permission
export async function DeleteRole(id: number) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.delete(`/roles/${id}`, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    throw 'Failed to delete role.';
  }
}
