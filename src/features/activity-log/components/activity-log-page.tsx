'use client';

import { useEffect, useMemo } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import type { ActivityLogItem } from '../types';
import {
  getActivityLogColumns,
  activityLogDefaultSorting
} from './activity-log-columns';
import { useTranslate } from '@/hooks/use-translate';

type ActivityLogPageProps = {
  items: ActivityLogItem[];
};

export default function ActivityLogPage({ items }: ActivityLogPageProps) {
  const { t } = useTranslate();

  // Keep the columns stable so the table state does not reset on every render.
  const columns = useMemo(() => getActivityLogColumns(t), [t]);

  // Keep the browser tab title in sync with the selected admin language.
  useEffect(() => {
    document.title = t('activityLog.title');
  }, [t]);

  const table = useReactTable({
    data: items,
    columns,
    initialState: {
      sorting: activityLogDefaultSorting
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('activityLog.title')}
          description={t('activityLog.description')}
        />
      </div>

      <Separator />

      <DataTable table={table}>
        <div className='flex items-center justify-between'>
          <DataTableToolbar table={table} />
        </div>
      </DataTable>
    </div>
  );
}
