import * as z from 'zod';

import type { Section } from '@/server/action/section/types';
import type { LocalizedText } from '@/lib/helpers';

export const blockTypes = [
  'hero_banner',
  'stats',
  'benefits',
  'post_list'
  // 'work_groups'
] as const;
export const blockTypeLabel: Record<(typeof blockTypes)[number], string> = {
  hero_banner: 'Hero Banner',
  stats: 'Stats',
  benefits: 'Benefits',
  post_list: 'Post List'
  // work_groups: 'Work Groups'
};

const localizedRequired = z.string().trim().min(1, {
  message: 'English title is required.'
});

const localizedOptional = z.string().trim().optional();

const numberOrUndefined = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}, z.number().int().nonnegative().optional());

export const formSchema = z.object({
  pageId: z.coerce.number().int().positive({ message: 'Page is required.' }),
  blockType: z.enum(blockTypes, { required_error: 'Block type is required.' }),
  title: z.object({
    en: localizedRequired,
    km: localizedOptional
  }),
  description: z.object({
    en: localizedOptional,
    km: localizedOptional
  }),
  settings: z.object({
    sort: z.enum(['manual', 'latest']).optional(),
    limit: numberOrUndefined,
    categoryIds: z.array(z.number().int().positive()).optional()
  }),
  orderIndex: z.coerce
    .number()
    .int()
    .nonnegative()
    .min(0, { message: 'Order index must be 0 or higher.' }),
  enabled: z.boolean().default(true)
});

export type SectionFormValues = z.infer<typeof formSchema>;
export type BlockType = (typeof blockTypes)[number];

const getLocalizedValue = (value: LocalizedText, key: 'en' | 'km') => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const candidate = value[key];
  return typeof candidate === 'string' ? candidate : '';
};

export const defaultValues = (
  initialData: Section | null
): SectionFormValues => ({
  pageId: Number(initialData?.pageId ?? 0),
  blockType: (initialData?.blockType as BlockType) ?? 'hero_banner',
  title: {
    en: getLocalizedValue(initialData?.title, 'en'),
    km: getLocalizedValue(initialData?.title, 'km')
  },
  description: {
    en: getLocalizedValue(initialData?.description, 'en'),
    km: getLocalizedValue(initialData?.description, 'km')
  },
  settings: {
    sort: initialData?.settings?.sort,
    limit: initialData?.settings?.limit,
    categoryIds: initialData?.settings?.categoryIds ?? []
  },
  orderIndex: initialData?.orderIndex ?? 0,
  enabled: initialData?.enabled ?? true
});
