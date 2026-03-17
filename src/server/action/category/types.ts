import type { LocalizedText } from '@/lib/helpers';

export type CategoryPage = {
  id: number | string;
  title?: LocalizedText;
  slug?: string;
};

//create category types
export type Category = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  pageIds?: Array<number | string>;
  pages?: CategoryPage[];
  relation?: {
    pages?: CategoryPage[];
  };
};
