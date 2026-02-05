import type { LocalizedText } from '@/lib/helpers';

export type WorkingGroupLocalizedInput = {
  en: string;
  km?: string;
};

export type WorkingGroupInput = {
  title: WorkingGroupLocalizedInput;
  description?: WorkingGroupLocalizedInput;
  iconUrl?: string;
  status: 'published' | 'draft';
  pageId?: number | string | null;
  orderIndex?: number;
};

export type WorkingGroupItem = {
  id: number | string;
  title?: LocalizedText;
  description?: LocalizedText;
  iconUrl?: string;
  status?: 'published' | 'draft' | string;
  orderIndex?: number;
  pageId?: number | string;
  page?: {
    id?: number | string;
    title?: LocalizedText;
    slug?: string;
  };
  createdBy?: {
    id?: number | string;
    displayName?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};
