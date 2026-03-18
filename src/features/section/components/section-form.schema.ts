import * as z from 'zod';

import type { Section } from '@/server/action/section/types';
import type { LocalizedText } from '@/lib/helpers';

export const WORKING_GROUP_CO_CHAIRS = 'working_group_co_chairs' as const;
export const ANNUAL_REPORTS = 'annual_reports' as const;
export const ISSUES_RESPONSES = 'issues_responses' as const;
export const ANNOUNCEMENT = 'announcement' as const;
export const POST_LIST = 'post_list' as const;
export const WG_TEMPLATE = 'wg_template' as const;

export const blockTypes = [
  'hero_banner',
  'stats',
  POST_LIST,
  ANNOUNCEMENT,
  WG_TEMPLATE,
  'text_block',
  WORKING_GROUP_CO_CHAIRS,
  ANNUAL_REPORTS
  // ISSUES_RESPONSES
] as const;
export const blockTypeLabel: Record<(typeof blockTypes)[number], string> = {
  hero_banner: 'Hero Banner',
  stats: 'Stats',
  [POST_LIST]: 'Post List',
  [ANNOUNCEMENT]: 'Announcement',
  [WG_TEMPLATE]: 'WG Template',
  text_block: 'Text Block',
  [WORKING_GROUP_CO_CHAIRS]: 'Working Group Co-Chairs',
  [ANNUAL_REPORTS]: 'Annual Reports'
  // [ISSUES_RESPONSES]: 'Issues & Responses'
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

export const supportsSettingsWithCategories = (blockType: BlockType) =>
  blockType === POST_LIST || blockType === ANNOUNCEMENT;

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
