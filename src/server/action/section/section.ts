'use server';
import 'server-only';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type { SectionPayload } from './types';

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const payload = error.response?.data as any;
    const message = payload?.message ?? payload?.error ?? error.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function normalizeSectionId(sectionId: number | string) {
  const value = String(sectionId ?? '').trim();
  if (!value) {
    throw new Error('Section id is required');
  }
  return value;
}

// Use the shared auth header helper so section requests work in production too.
export async function createSection(data: SectionPayload) {
  const headers = await getAuthHeaders();

  try {
    const response = await api.post('/sections', data, {
      headers,
      withCredentials: true
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to create section'));
  }
}

export async function updateSection(
  sectionId: number | string,
  data: Partial<SectionPayload>
) {
  const id = normalizeSectionId(sectionId);
  const headers = await getAuthHeaders();

  try {
    const response = await api.put(
      `/sections/${encodeURIComponent(id)}`,
      data,
      {
        headers,
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to update section'));
  }
}

export async function getSectionById(sectionId: number | string) {
  const id = normalizeSectionId(sectionId);
  const headers = await getAuthHeaders();

  try {
    const response = await api.get(`/sections/${encodeURIComponent(id)}`, {
      headers,
      withCredentials: true
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch section'));
  }
}

export async function deleteSection(sectionId: number) {
  const id = normalizeSectionId(sectionId);
  const headers = await getAuthHeaders();

  try {
    await api.delete(`/sections/${encodeURIComponent(id)}`, {
      headers,
      withCredentials: true
    });
    return true;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to delete section'));
  }
}
