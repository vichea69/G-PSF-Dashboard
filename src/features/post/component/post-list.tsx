'use client';
import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useLanguage } from '@/context/language-context';
import { usePost } from '@/hooks/use-post';
import { getLocalizedText } from '@/lib/helpers';
import { PostTableList } from './post-tables';

export default function PostsListPage() {
  const { data, isLoading } = usePost();
  const { language } = useLanguage();
  const list = useMemo(() => {
    const raw = (data?.data ?? data) as any;
    const items = Array.isArray(raw) ? raw : raw ? [raw] : [];

    return items.map((item) => {
      const sectionLabel = getLocalizedText(
        item?.section?.title ?? item?.section?.name,
        language
      );

      return {
        ...item,
        title: getLocalizedText(item?.title, language),
        category: item?.category
          ? {
              ...item.category,
              name: getLocalizedText(item?.category?.name, language)
            }
          : item?.category,
        section: item?.section
          ? {
              ...item.section,
              title: sectionLabel || item?.section?.title,
              name: sectionLabel || item?.section?.name
            }
          : item?.section,
        page: item?.page
          ? {
              ...item.page,
              title: getLocalizedText(item?.page?.title, language)
            }
          : item?.page
      };
    });
  }, [data, language]);
  if (isLoading) return <DataTableSkeleton columnCount={8} rowCount={8} />;
  return <PostTableList data={list} />;
}
