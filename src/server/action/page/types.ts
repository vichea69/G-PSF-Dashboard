// Types for Pages CRUD

export type PageSeo = {
  metaTitle?: string;
  metaDescription?: string;
};

export type Page = {
  id: number | string;
  title: string;
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
  title: string;
  slug?: string;
  content?: string;
  status: 'published' | 'draft';
  // Accept either flat meta* fields or nested seo to be flexible
  metaTitle?: string;
  metaDescription?: string;
  seo?: PageSeo;
};
