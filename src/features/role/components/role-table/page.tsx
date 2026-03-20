'use client';
import * as React from 'react';
import { getRoleColumns } from './columns';
import { DataTable } from './data-table';
import { useRole } from '@/features/role/hook/use-role';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useTranslate } from '@/hooks/use-translate';

export default function RolesTablePage() {
  // This hook now reads roles through server actions,
  // which fixes the 401 browser requests seen in production.
  const { data, isLoading, isError } = useRole();
  const { t } = useTranslate();
  // Rebuild columns when the language changes so labels stay translated.
  const tableColumns = React.useMemo(() => getRoleColumns(t), [t]);
  const rows = React.useMemo(() => data ?? [], [data]);

  if (isLoading)
    return <DataTableSkeleton columnCount={6} filterCount={6} rowCount={8} />;
  if (isError) {
    return <div className='text-destructive'>{t('role.toast.loadFailed')}</div>;
  }

  return <DataTable columns={tableColumns} data={rows} />;
}
