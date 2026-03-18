'use client';
import type { ReactNode } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { PageTableList } from './page-tables';

type PagesListPageProps = {
  fallback?: ReactNode;
};

export default function PagesListPage({ fallback }: PagesListPageProps) {
  const { data, isLoading } = usePage();
  if (isLoading) {
    return fallback ?? <DataTableSkeleton columnCount={5} rowCount={8} />;
  }
  const rows = extractPageRows(data);
  return <PageTableList data={rows as any} />;
}
