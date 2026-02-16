import type { PostContent } from '@/server/action/post/types';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import type { HeroBannerData } from '@/features/post/component/block/hero-banner/hero-banner-form';
import type {
  DerivedPostFields,
  LocalizedPostContent
} from '@/features/post/component/post-form-types';

const parseJsonObject = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null;
  if (typeof value === 'object') return value as Record<string, unknown>;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
  }

  return null;
};

export const parseId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const readString = (value: unknown) => (typeof value === 'string' ? value : '');

export const normalizeImageUrl = (value: unknown) =>
  resolveApiAssetUrl(typeof value === 'string' ? value : '');

const parseContentValue = (
  value: unknown
): PostContent | HeroBannerData | string => {
  if (!value) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return parsed as PostContent | HeroBannerData;
        }
      } catch {
        return value;
      }
    }

    return value;
  }

  return value as PostContent;
};

const isLocalizedContent = (
  value: unknown
): value is { en?: unknown; km?: unknown } => {
  if (!value || typeof value !== 'object') return false;
  return 'en' in value || 'km' in value;
};

const normalizeLocalizedContent = (value: unknown): LocalizedPostContent => {
  if (!value) return { en: '' };

  let parsedValue: unknown = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return { en: '' };

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        parsedValue = JSON.parse(trimmed);
      } catch {
        return { en: value };
      }
    } else {
      return { en: value };
    }
  }

  if (isLocalizedContent(parsedValue)) {
    const record = parsedValue as Record<string, unknown>;
    const enValue = parseContentValue(record.en);
    const kmValue = record.km !== undefined ? parseContentValue(record.km) : '';

    return {
      en: enValue ?? '',
      ...(kmValue ? { km: kmValue } : {})
    };
  }

  return { en: parseContentValue(parsedValue) };
};

export const isHeroBannerContent = (
  value: unknown
): value is HeroBannerData => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as HeroBannerData;

  return (
    typeof candidate.title === 'object' &&
    typeof candidate.subtitle === 'object' &&
    typeof candidate.description === 'object' &&
    Array.isArray(candidate.backgroundImages) &&
    Array.isArray(candidate.ctas)
  );
};

export const getLocalizedContent = (
  content: LocalizedPostContent | undefined,
  language: 'en' | 'km'
): PostContent | string => {
  if (!content) return '';
  const value = language === 'km' ? (content.km ?? '') : (content.en ?? '');
  return isHeroBannerContent(value) ? '' : (value as PostContent | string);
};

export const derivePostFields = (post: any): DerivedPostFields => {
  const titleObj = parseJsonObject(post?.title);
  const titleEn =
    (typeof titleObj?.en === 'string' ? titleObj.en : '') ||
    readString(post?.title);
  const titleKm = typeof titleObj?.km === 'string' ? titleObj.km : '';

  const descriptionObj = parseJsonObject(post?.description);
  const descriptionEn =
    (typeof descriptionObj?.en === 'string' ? descriptionObj.en : '') ||
    readString(post?.description);
  const descriptionKm =
    typeof descriptionObj?.km === 'string' ? descriptionObj.km : '';

  const content = normalizeLocalizedContent(post?.content);
  const title = titleEn || titleKm || readString(post?.title);

  return {
    title,
    titleEn,
    titleKm,
    descriptionEn,
    descriptionKm,
    coverImage: readString(post?.coverImage),
    document: readString(post?.document),
    documentThumbnail: readString(
      post?.documentThumbnail ?? post?.document_thumbnail
    ),
    link: readString(post?.link),
    content
  };
};
