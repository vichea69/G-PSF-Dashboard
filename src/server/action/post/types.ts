export type Post = {
  id: number | string;
  title: { en: string; km?: string } | string;
  slug: string;
  publishDate?: string;
  publishedAt?: string;
  isFeatured?: boolean;
  coverImage?: string;
  documents?: LocalizedPostDocuments;
  link?: string;
  content: LocalizedContent<PostContentValue> | PostContentValue;
  status: 'published' | 'draft' | string;
  createdAt: string;
  updatedAt: string;
  author?: PostAuthor;
  category?: PostCategory;
  page?: PostPage;
};

export type PostInput = {
  title: { en: string; km?: string } | string;
  slug?: string;
  description?: { en?: string; km?: string } | string;
  content?: LocalizedContent<PostContentValue> | PostContentValue;
  status: 'published' | 'draft';
  publishedAt?: string;
  isFeatured?: boolean;
  categoryId?: number | string;
  pageId?: number | string;
  sectionId?: number | string;
  coverImage?: string;
  documents?: LocalizedPostDocuments;
  link?: string;
};

export type PostDocumentAsset = {
  url?: string;
  thumbnailUrl?: string;
};

export type LocalizedPostDocuments = {
  en?: PostDocumentAsset;
  km?: PostDocumentAsset;
};

export type PostContentValue = PostContent | string | Record<string, unknown>;

export type LocalizedContent<T = Record<string, unknown>> = {
  en: T;
  km?: T;
};

export type PostContent = {
  type: string;
  content?: PostContentNode[];
};

export type PostContentNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PostContentNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export type PostAuthor = {
  id: number;
  displayName: string;
  email: string;
};

export type PostCategory = {
  id: number;
  name: string;
};

export type PostPage = {
  id: number;
  title: string;
  slug: string;
};
