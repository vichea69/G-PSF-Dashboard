'use client';

import { useMemo } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import type { ActivityLogItem } from '../types';
import {
  getActivityLogColumns,
  activityLogDefaultSorting
} from './activity-log-columns';

type ActivityLogPageProps = {
  items: ActivityLogItem[];
};

export default function ActivityLogPage({ items }: ActivityLogPageProps) {
  // Keep the columns stable so the table state does not reset on every render.
  const columns = useMemo(() => getActivityLogColumns(), []);

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
    <DataTable table={table}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
