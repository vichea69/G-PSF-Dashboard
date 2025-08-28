'use server';
import 'server-only';
import { api } from '@/lib/api';

export type PageInput = {
  title: string;
  slug?: string;
  content?: string;
  status: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
};

export async function createPage(input: PageInput) {
  const res = await api.post('/pages', input);
  return res.data;
}

export async function updatePage(id: string | number, input: PageInput) {
  const res = await api.put(`/pages/${id}`, input);
  return res.data;
}

export async function deletePage(id: string | number) {
  const res = await api.delete(`/pages/${id}`);
  return res.data;
}

export async function getPageById(id: string | number) {
  const res = await api.get(`/pages/${id}`);
  return res.data;
}
