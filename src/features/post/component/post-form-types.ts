import type { PostContent } from '@/server/action/post/types';
import type { HeroBannerData } from '@/features/post/component/block/hero-banner/hero-banner-form';

export type LocalizedPostContent = {
  en: PostContent | HeroBannerData | string;
  km?: PostContent | HeroBannerData | string;
};

export type PostFormData = {
  title: string;
  titleEn?: string;
  titleKm?: string;
  descriptionEn?: string;
  descriptionKm?: string;
  coverImage?: string;
  document?: string;
  documentThumbnail?: string;
  link?: string;
  status: 'published' | 'draft';
  content?: LocalizedPostContent;
  categoryId?: number | string;
  sectionId?: number | string;
  pageId?: number | string;
  newImages: File[];
  existingImageIds: number[];
  removedImageIds: number[];
};

export type EditingImage = {
  key: string;
  id?: number;
  url: string;
  sortOrder: number;
  fileName: string;
  size: number;
  mimeType: string;
};

export type InitialFileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type DerivedPostFields = {
  title: string;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  coverImage: string;
  document: string;
  documentThumbnail: string;
  link: string;
  content: LocalizedPostContent;
};
