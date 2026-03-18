'use client';
import * as React from 'react';
import { UsersTable } from './user-tables';
import { useUser } from '@/hooks/use-user';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useTranslate } from '@/hooks/use-translate';

export default function UsersViewPage() {
  const { data, isLoading, isError } = useUser();
  const { t } = useTranslate();

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={8} />;
  if (isError)
    return <div className='text-destructive'>{t('user.toast.loadFailed')}</div>;

  const rows = (data?.data ?? data) as any[];
  return <UsersTable data={rows as any} />;
}
