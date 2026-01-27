'use client';
import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useLanguage } from '@/context/language-context';
import { useCategory } from '@/hooks/use-category';
import { getLocalizedText } from '@/lib/helpers';
import { CategoriesTable } from './category-tables';

export default function CategoriesViewPage() {
  const { data, isLoading } = useCategory();
  const { language } = useLanguage();
  const rows = useMemo(() => {
    const raw = (data?.data ?? data) as any;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      ...item,
      name: getLocalizedText(item?.name, language),
      description: getLocalizedText(item?.description, language)
    }));
  }, [data, language]);
  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={8} />;

  return <CategoriesTable data={rows as any} />;
}
