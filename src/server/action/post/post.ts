'use server';
import 'server-only';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import { isAxiosError } from 'axios';
import type { PostInput } from './types';

// Create post using server action
export async function createPost(payload: PostInput | FormData) {
  const headers = await getAuthHeaders();
  const res = await api.post('/posts', payload, {
    headers,
    withCredentials: true
  });
  return res.data;
}
// Update post using server action
export async function updatePost(
  postId: number | string,
  payload: PostInput | FormData
) {
  const headers = await getAuthHeaders();
  const res = await api.put(`/posts/${postId}`, payload, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function getPost(postId: number | string) {
  const trimmedId = String(postId ?? '').trim();
  if (!trimmedId) {
    return { success: false, error: 'Post id is required' };
  }

  const headers = await getAuthHeaders();
  const url = `/posts/${encodeURIComponent(trimmedId)}`;

  try {
    const res = await api.get(url, {
      headers,
      withCredentials: true
    });
    const raw = res.data;
    const data = raw?.data?.post ?? raw?.data ?? raw?.post ?? raw;

    return { success: true, data };
  } catch (error: unknown) {
    const message = isAxiosError(error)
      ? ((error.response?.data as any)?.message ??
        (error.response?.data as any)?.error ??
        error.message)
      : error instanceof Error
        ? error.message
        : null;

    return { success: false, error: message ?? 'Failed to fetch post' };
  }
}
