'use client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useCategory } from '@/hooks/use-category';
import { CategoriesTable } from './category-tables';

export default function CategoriesViewPage() {
  const { data, isLoading } = useCategory();
  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={8} />;
  const rows = (data?.data ?? data) as any[];
  return <CategoriesTable data={rows as any} />;
}
