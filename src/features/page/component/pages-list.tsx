'use client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { PageTableList } from './page-tables';

export default function PagesListPage() {
  const { data, isLoading } = usePage();
  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={8} />;
  const rows = extractPageRows(data);
  return <PageTableList data={rows as any} />;
}
