'use client';
import type { ReactNode } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { SectionTableList } from './section-table';
import { useSection } from '@/features/section/hook/use-section';

type SectionsListPageProps = {
  fallback?: ReactNode;
};

export default function SectionsListPage({ fallback }: SectionsListPageProps) {
  // Fetch sections data using the custom hook
  const { data, isLoading } = useSection();
  if (isLoading) {
    return fallback ?? <DataTableSkeleton columnCount={6} rowCount={8} />;
  }
  const sections = data || [];

  return <SectionTableList data={sections} />;
}
