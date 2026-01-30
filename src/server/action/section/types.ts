import type { LocalizedText } from '@/lib/helpers';

export type SectionSettings = {
  categoryIds?: number[];
  limit?: number;
  sort?: 'manual' | 'latest';
};

export type SectionPayload = {
  pageId: number;
  blockType: string;
  title?: LocalizedText;
  description?: LocalizedText;
  settings?: SectionSettings;
  enabled?: boolean;
  orderIndex?: number;
};

export type Section = SectionPayload & {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
};
