'use server';

import { ListContactResponse, Contact } from './types';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
).replace(/\/$/, '');
const API_PREFIX = '/api/v1'; // because your NestJS uses app.setGlobalPrefix('api/v1')

async function parseError(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    const json = JSON.parse(text);
    return json?.message ? JSON.stringify(json.message) : text;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

export async function getContacts(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<ListContactResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));

  const url = `${API_BASE}${API_PREFIX}/contact${sp.toString() ? `?${sp}` : ''}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseError(res));

  const json = await res.json();
  return json?.data ?? json;
}

export async function getContactById(id: string): Promise<Contact> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/contact/${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseError(res));

  const json = await res.json();
  return json?.data ?? json;
}

export async function createContact(body: {
  firstName: string;
  lastName: string;
  email: string;
  organisationName?: string;
  subject: string;
  message: string;
}): Promise<Contact> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(await parseError(res));

  const json = await res.json();
  return json?.data ?? json;
}

export async function updateContact(
  id: string,
  body: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    organisationName: string;
    subject: string;
    message: string;
    isRead: boolean;
  }>
): Promise<Contact> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/contact/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(await parseError(res));

  const json = await res.json();
  return json?.data ?? json;
}

export async function markContactRead(
  id: string,
  isRead: boolean
): Promise<Contact> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/contact/${id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead })
  });

  if (!res.ok) throw new Error(await parseError(res));

  const json = await res.json();
  return json?.data ?? json;
}

export async function deleteContact(id: string): Promise<{ success: true }> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/contact/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) throw new Error(await parseError(res));

  const json = await res.json();
  return json?.data ?? json;
}
