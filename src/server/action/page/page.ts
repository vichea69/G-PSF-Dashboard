'use server';
import 'server-only';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

export type PageInput = {
  title: string;
  slug?: string;
  content?: string;
  status: 'published' | 'draft';
  metaTitle?: string;
  metaDescription?: string;
};

export async function createPage(input: PageInput) {
  const headers = await getAuthHeaders();
  const res = await api.post('/pages', input, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function updatePage(id: string | number, input: PageInput) {
  const headers = await getAuthHeaders();
  const res = await api.put(`/pages/${id}`, input, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function deletePage(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.delete(`/pages/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function getPageById(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.get(`/pages/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}
