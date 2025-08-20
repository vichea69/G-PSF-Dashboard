'use client';
import * as React from 'react';
import { UsersTable } from './user-tables';
import { useUser } from '@/hooks/use-user';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export default function UsersViewPage() {
  const { data, isLoading, isError } = useUser();

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={8} />;
  if (isError)
    return <div className='text-destructive'>Failed to load users</div>;

  const rows = (data?.data ?? data) as any[];
  return <UsersTable data={rows as any} />;
}
