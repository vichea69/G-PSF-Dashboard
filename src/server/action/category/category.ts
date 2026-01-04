'use server';
import 'server-only';
import { api } from '@/lib/api';
import { Category } from './types';
import { getAuthHeaders } from '@/server/action/userAuth/user';

type CategoryInput = {
  name: string;
  description?: string;
};

//create category using api with server action
export async function createCategory(payload: CategoryInput) {
  const headers = await getAuthHeaders();
  const res = await api.post('/categories', payload, {
    headers,
    withCredentials: true
  });
  return res.data;
}
// update category using api with server action
export async function updateCategory(id: string, payload: CategoryInput) {
  const headers = await getAuthHeaders();
  const res = await api.put(`/categories/${id}`, payload, {
    headers,
    withCredentials: true
  });
  return res.data;
}
// delete category using api with server action
export async function deleteCategory(id: string) {
  const headers = await getAuthHeaders();
  const res = await api.delete(`/categories/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}
// get category by id using api with server action
export async function getCategoryById(id: string) {
  const headers = await getAuthHeaders();
  const res = await api.get(`/categories/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}
