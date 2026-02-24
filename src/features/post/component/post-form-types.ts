import type { PostContent } from '@/server/action/post/types';
import type { HeroBannerData } from '@/features/post/component/block/hero-banner/hero-banner-form';
import type { StatsBlockData } from '@/features/post/component/block/stats/stats-form';

export type LocalizedPostContent = {
  en: PostContent | HeroBannerData | StatsBlockData | string;
  km?: PostContent | HeroBannerData | StatsBlockData | string;
};

export type PostDocumentAsset = {
  url?: string;
  thumbnailUrl?: string;
};

export type LocalizedPostDocuments = {
  en?: PostDocumentAsset;
  km?: PostDocumentAsset;
};

export type PostFormData = {
  title: string;
  titleEn?: string;
  titleKm?: string;
  descriptionEn?: string;
  descriptionKm?: string;
  publishDate?: string;
  expiredDate?: string;
  isFeatured: boolean;
  coverImage?: string;
  document?: string;
  documentThumbnail?: string;
  documents?: LocalizedPostDocuments;
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
  publishDate: string;
  expiredDate: string;
  isFeatured: boolean;
  coverImage: string;
  document: string;
  documentThumbnail: string;
  documents: LocalizedPostDocuments;
  link: string;
  content: LocalizedPostContent;
};
