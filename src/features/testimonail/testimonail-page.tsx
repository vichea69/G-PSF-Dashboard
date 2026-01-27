'use client';
import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useTestimonials } from '@/hooks/use-testimonial';
import { TestimonialTableList } from './components/testimonail-tables';
import type { TestimonialRow } from './components/testimonail-tables/culumns';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/helpers';

export default function TestimonialPage() {
  const { data, isLoading } = useTestimonials();
  const { language } = useLanguage();
  const rows = useMemo(() => {
    const raw = (data?.data ?? data) as any;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list.map((item) => ({
      ...item,
      title: getLocalizedText(item?.title, language),
      quote: getLocalizedText(item?.quote, language),
      authorName: getLocalizedText(item?.authorName, language),
      authorRole: getLocalizedText(item?.authorRole, language)
    }));
  }, [data, language]);

  if (isLoading) return <DataTableSkeleton columnCount={7} rowCount={8} />;

  return <TestimonialTableList data={rows as TestimonialRow[]} />;
}
