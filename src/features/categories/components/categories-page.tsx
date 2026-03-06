'use client';
import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useLanguage } from '@/context/language-context';
import { useCategory } from '@/hooks/use-category';
import { getLocalizedText } from '@/lib/helpers';
import { CategoriesTable } from './category-tables';

function extractCategoryRows(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export default function CategoriesViewPage() {
  const { data, isLoading } = useCategory();
  const { language } = useLanguage();

  const rows = useMemo(() => {
    const rawRows = extractCategoryRows(data);
    return rawRows.map((item) => ({
      ...item,
      name: getLocalizedText(item?.name, language),
      description: getLocalizedText(item?.description, language)
    }));
  }, [data, language]);

  if (isLoading) return <DataTableSkeleton columnCount={9} rowCount={8} />;

  return <CategoriesTable data={rows as any} />;
}
