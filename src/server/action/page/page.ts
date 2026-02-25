'use server';
import 'server-only';
import { api } from '@/lib/api';
import type { LocalizedText } from '@/lib/helpers';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import { isAxiosError } from 'axios';

export type PageInput = {
  title: LocalizedText;
  status: 'published' | 'draft';
  metaTitle: LocalizedText;
  metaDescription: LocalizedText;
  slug?: string;
  seo?: {
    metaTitle?: LocalizedText;
    metaDescription?: LocalizedText;
  };
};

function normalizePageIdentifier(id: string | number) {
  const pageId = String(id ?? '').trim();
  if (!pageId) {
    throw new Error('Page id is required');
  }
  return pageId;
}

function extractPageRows(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

async function findPageSlugById(
  pageId: string,
  headers: Record<string, string | undefined>
) {
  try {
    const listResponse = await api.get('/pages', {
      headers,
      withCredentials: true
    });
    const rows = extractPageRows(listResponse.data);
    const matched = rows.find((row: any) => String(row?.id ?? '') === pageId);
    const slug = String(matched?.slug ?? '').trim();
    return slug || null;
  } catch {
    return null;
  }
}

async function requestPageByIdentifier(
  pageId: string,
  headers: Record<string, string | undefined>,
  request: (identifier: string) => Promise<any>
) {
  try {
    return await request(pageId);
  } catch (error: unknown) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status !== 404) throw error;

    // Compatibility fallback for APIs that resolve GET by slug.
    const slug = await findPageSlugById(pageId, headers);
    if (!slug || slug === pageId) throw error;

    return request(slug);
  }
}

function buildPagePayloadVariants(input: PageInput) {
  const slug = String(input.slug ?? '').trim();
  const seo = {
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription
  };
  const base: Record<string, unknown> = {
    title: input.title,
    status: input.status
  };

  const directBaseVariants: Record<string, unknown>[] = [
    {
      ...base,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription
    },
    {
      ...base,
      seo
    },
    {
      ...base,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      seo
    }
  ];

  const withSlugVariants = slug
    ? directBaseVariants.map((variant) => ({ ...variant, slug }))
    : [];
  const directVariants = [...directBaseVariants, ...withSlugVariants];
  const wrappedVariants = directVariants.map((variant) => ({ data: variant }));
  const variants = [...directVariants, ...wrappedVariants];

  const unique = new Map<string, Record<string, unknown>>();
  for (const variant of variants) {
    unique.set(JSON.stringify(variant), variant);
  }
  return Array.from(unique.values());
}

async function requestWithPayloadFallback(
  input: PageInput,
  request: (payload: Record<string, unknown>) => Promise<any>
) {
  const variants = buildPagePayloadVariants(input);
  let lastError: unknown = null;

  for (const payload of variants) {
    try {
      return await request(payload);
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 400) throw error;
      lastError = error;
    }
  }

  throw lastError ?? new Error('Invalid page payload');
}

export async function createPage(input: PageInput) {
  const headers = await getAuthHeaders();
  const res = await requestWithPayloadFallback(input, (payload) =>
    api.post('/pages', payload, {
      headers,
      withCredentials: true
    })
  );
  return res.data;
}

export async function updatePage(id: string | number, input: PageInput) {
  const pageId = normalizePageIdentifier(id);

  const headers = await getAuthHeaders();
  const res = await requestWithPayloadFallback(input, (payload) =>
    api.put(`/pages/${encodeURIComponent(pageId)}`, payload, {
      headers,
      withCredentials: true
    })
  );
  return res.data;
}

export async function deletePage(id: string | number) {
  const pageId = normalizePageIdentifier(id);

  const headers = await getAuthHeaders();
  const res = await api.delete(`/pages/${encodeURIComponent(pageId)}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function getPageById(id: string | number) {
  const pageId = normalizePageIdentifier(id);

  const headers = await getAuthHeaders();
  const res = await requestPageByIdentifier(pageId, headers, (identifier) =>
    api.get(`/pages/${encodeURIComponent(identifier)}`, {
      headers,
      withCredentials: true
    })
  );
  return res.data;
}
