'use client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { usePage } from '@/hooks/use-page';
import { PageTableList } from './page-tables';

export default function PagesListPage() {
  const { data, isLoading } = usePage();
  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={8} />;
  const rows = (data?.data ?? data) as any[];
  return <PageTableList data={rows as any} />;
}
