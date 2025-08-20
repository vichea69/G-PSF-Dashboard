'use server';
import 'server-only';
import { api } from '@/lib/api';
import { Category } from './types';

//create category using api with server action
export async function createCategory(category: Category) {
  const res = await api.post('/categories', category);
  return res.data;
}
// update category using api with server action
export async function updateCategory(category: Category) {
  const res = await api.put(`/categories/${category.id}`, category);
  return res.data;
}
// delete category using api with server action
export async function deleteCategory(id: string) {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
}
// get category by id using api with server action
export async function getCategoryById(id: string) {
  const res = await api.get(`/categories/${id}`);
  return res.data;
}
