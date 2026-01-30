import { useMemo } from 'react';

import { useCategory } from '@/hooks/use-category';
import { useLanguage } from '@/context/language-context';
import { usePage } from '@/hooks/use-page';
import { getLocalizedText } from '@/lib/helpers';

export type CategoryOption = { value: number; label: string };

export function useSectionFormData() {
  const { data: pagesData, isLoading: pagesLoading } = usePage();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategory();
  const { language } = useLanguage();

  const pages = useMemo(
    () => ((pagesData as any)?.data ?? pagesData ?? []) as any[],
    [pagesData]
  );

  const categories = useMemo(
    () => ((categoriesData as any)?.data ?? categoriesData ?? []) as any[],
    [categoriesData]
  );

  const categoryOptions: CategoryOption[] = useMemo(
    () =>
      categories
        .map((category) => ({
          value: Number(category?.id),
          label:
            getLocalizedText(category?.name, language) ||
            `Category ${category?.id ?? ''}`
        }))
        .filter((option) => Number.isFinite(option.value)),
    [categories, language]
  );

  return {
    pages,
    categoryOptions,
    isLoading: pagesLoading || categoriesLoading
  };
}
