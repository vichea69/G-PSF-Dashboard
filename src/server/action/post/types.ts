export type Post = {
  id: number | string;
  title: { en: string; km?: string } | string;
  slug: string;
  content: LocalizedContent<PostContentValue> | PostContentValue;
  status: 'published' | 'draft' | string;
  images?: PostImage[];
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
  categoryId?: number | string;
  pageId?: number | string;
  sectionId?: number | string;
  existingImageIds?: number[];
  removedImageIds?: number[];
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

export type PostImage = {
  id: number;
  url: string;
  sortOrder?: number | null;
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
