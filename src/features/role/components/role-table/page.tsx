'use client';
import * as React from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useRole } from '@/features/role/hook/use-role';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export default function RolesTablePage() {
  // This hook now reads roles through server actions,
  // which fixes the 401 browser requests seen in production.
  const { data, isLoading, isError } = useRole();
  const tableColumns = React.useMemo(() => columns, []);

  if (isLoading)
    return <DataTableSkeleton columnCount={6} filterCount={6} rowCount={8} />;
  if (isError) {
    return <div className='text-destructive'>Failed to load roles</div>;
  }

  return <DataTable columns={tableColumns} data={data ?? []} />;
}
