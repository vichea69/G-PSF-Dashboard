'use client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useLogo } from '@/hooks/use-logo';
import { LogoTableList } from './logo-tables';

export default function LogoListPage() {
  const { data, isLoading, isError } = useLogo();
  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={6} />;
  if (isError)
    return <div className='text-destructive'>Failed to load logos</div>;

  // Simple, beginner‑friendly shape:
  // Your API returns: { success, message, data: { logos: [...] }, ... }
  const logos = (data?.data?.logos ?? []) as any[];

  return <LogoTableList data={logos} />;
}
