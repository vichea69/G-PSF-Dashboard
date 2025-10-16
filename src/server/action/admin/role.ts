'use server';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type { CreateRole } from './types';

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
//Create role and permission
export async function CreateRole(payload: CreateRole) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.post('/roles', payload, {
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
      'Failed to create role.';
    throw new Error(message);
  }
}
//Edit permission in role
export async function EditRole(id: number, payload: CreateRole) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.put(`/roles/${id}/permissions`, payload, {
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
      'Failed to edit role.';
    throw new Error(message);
  }
}
