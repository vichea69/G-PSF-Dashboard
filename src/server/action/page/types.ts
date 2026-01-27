// Types for Pages CRUD

import type { LocalizedText } from '@/lib/helpers';

export type PageSeo = {
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
};

export type Page = {
  id: number | string;
  title: LocalizedText;
  slug: string;
  status: 'published' | 'draft' | string;
  content?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorId?: {
    id: number;
    displayName: string;
    email: string;
  };
  seo?: PageSeo;
};

export type PageUpsert = {
  title: LocalizedText;
  slug?: string;
  content?: string;
  status: 'published' | 'draft';
  // Accept either flat meta* fields or nested seo to be flexible
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  seo?: PageSeo;
};
