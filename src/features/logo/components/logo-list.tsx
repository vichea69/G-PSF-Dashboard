'use client';
import { useLogo } from '@/features/logo/hook/use-logo';
import { LogoTableList } from './logo-tables';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { LogoType } from '@/features/logo/type/logo-type';

export default function LogoListPage() {
  const { data, isLoading, isError, error } = useLogo();

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={8} />;
  }

  if (isError) {
    return (
      <div className='text-destructive'>
        {error instanceof Error ? error.message : 'Failed to load logos'}
      </div>
    );
  }

  const raw = data?.data?.logos ?? data?.data?.items ?? data?.data ?? [];
  const logos: LogoType[] = Array.isArray(raw) ? (raw as LogoType[]) : [];

  return <LogoTableList data={logos} />;
}
