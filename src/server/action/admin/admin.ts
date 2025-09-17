//Admin actions CRUD ON USERS
'use server';
import 'server-only';
import { api } from '@/lib/api';
import { AdminUserCreate, AdminUserUpdate } from './types';
import { getAuthHeaders } from '../userAuth/user';

//create admin user using api with server action
// Accepts payload like:
// { user: { username, email, password, role, bio?, image? } }
export async function createAdminUser(adminUser: AdminUserCreate) {
  const headers = await getAuthHeaders();
  const res = await api.post(
    '/users',
    { user: adminUser },
    { headers, withCredentials: true }
  );
  return res.data;
}
export async function updateAdminUser(adminUser: AdminUserUpdate) {
  const headers = await getAuthHeaders();
  const { id, ...payload } = adminUser as any;
  try {
    const res = await api.put(
      `/users/${id}`,
      { user: payload },
      {
        headers,
        withCredentials: true
      }
    );
    return res.data;
  } catch (e: any) {
    const detail = e?.response?.data;
    const msg =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      e?.message ||
      'Update failed';
    throw new Error(msg);
  }
}
export async function deleteAdminUser(id: string) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.delete(`/users/${id}`, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (e: any) {
    const detail = e?.response?.data;
    const msg =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      e?.message ||
      'Delete failed';
    throw new Error(msg);
  }
}
