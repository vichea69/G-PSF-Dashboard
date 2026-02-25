'use server';
import 'server-only';

import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type { Contact, ListContactResponse, PaginationMeta } from './types';

type ContactQueryParams = {
  q?: string;
  page?: number;
  limit?: number;
};

type ContactMutationBody = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  organisationName: string | null;
  subject: string;
  message: string;
  isRead: boolean;
}>;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as any;
    const message = payload?.message ?? payload?.error ?? error.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;
    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function toPositiveNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function normalizeContactList(
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number
): ListContactResponse {
  if (Array.isArray(value)) {
    const items = value as Contact[];
    const meta: PaginationMeta = {
      total: items.length,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: Math.max(1, Math.ceil(items.length / fallbackLimit))
    };
    return { items, meta };
  }

  if (!value || typeof value !== 'object') {
    const meta: PaginationMeta = {
      total: 0,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: 1
    };
    return { items: [], meta };
  }

  const record = value as Record<string, unknown>;
  const items = Array.isArray(record.items)
    ? (record.items as Contact[])
    : Array.isArray(record.data)
      ? (record.data as Contact[])
      : [];
  const metaValue =
    record.meta && typeof record.meta === 'object'
      ? (record.meta as Record<string, unknown>)
      : null;
  const total = toPositiveNumber(metaValue?.total, items.length);
  const page = toPositiveNumber(metaValue?.page, fallbackPage);
  const limit = toPositiveNumber(metaValue?.limit, fallbackLimit);
  const totalPages = toPositiveNumber(
    metaValue?.totalPages,
    Math.max(1, Math.ceil(total / limit))
  );

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages
    }
  };
}

function normalizeContactId(id: string): string {
  const contactId = String(id ?? '').trim();
  if (!contactId) {
    throw new Error('Contact id is required');
  }
  return contactId;
}

export async function getContacts(
  params: ContactQueryParams = {}
): Promise<ListContactResponse> {
  const headers = await getAuthHeaders();
  const page = toPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = toPositiveNumber(params.limit, DEFAULT_LIMIT);

  try {
    const res = await api.get('/contact', {
      params: {
        ...(params.q ? { q: params.q } : {}),
        page,
        limit
      },
      headers,
      withCredentials: true
    });
    const payload = res.data?.data ?? res.data;
    return normalizeContactList(payload, page, limit);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch contacts'));
  }
}

export async function getContactById(id: string): Promise<Contact> {
  const headers = await getAuthHeaders();
  const contactId = normalizeContactId(id);

  try {
    const res = await api.get(`/contact/${encodeURIComponent(contactId)}`, {
      headers,
      withCredentials: true
    });
    return (res.data?.data ?? res.data) as Contact;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch contact'));
  }
}

export async function createContact(
  body: ContactMutationBody
): Promise<Contact> {
  const headers = await getAuthHeaders();

  try {
    const res = await api.post('/contact', body, {
      headers,
      withCredentials: true
    });
    return (res.data?.data ?? res.data) as Contact;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to create contact'));
  }
}

export async function updateContact(
  id: string,
  body: ContactMutationBody
): Promise<Contact> {
  const headers = await getAuthHeaders();
  const contactId = normalizeContactId(id);

  try {
    const res = await api.patch(
      `/contact/${encodeURIComponent(contactId)}`,
      body,
      {
        headers,
        withCredentials: true
      }
    );
    return (res.data?.data ?? res.data) as Contact;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to update contact'));
  }
}

export async function markContactRead(
  id: string,
  isRead: boolean
): Promise<Contact> {
  const headers = await getAuthHeaders();
  const contactId = normalizeContactId(id);

  try {
    const res = await api.patch(
      `/contact/${encodeURIComponent(contactId)}/read`,
      { isRead },
      {
        headers,
        withCredentials: true
      }
    );
    return (res.data?.data ?? res.data) as Contact;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to update read status'));
  }
}

export async function deleteContact(id: string): Promise<{ success: true }> {
  const headers = await getAuthHeaders();
  const contactId = normalizeContactId(id);

  try {
    await api.delete(`/contact/${encodeURIComponent(contactId)}`, {
      headers,
      withCredentials: true
    });
    return { success: true };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to delete contact'));
  }
}
