'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { toast } from 'sonner';
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
  // Keep rows in local state so delete can update the table immediately.
  const [activityItems, setActivityItems] = useState(items);

  const handleDelete = useCallback((id: string) => {
    setActivityItems((current) => current.filter((item) => item.id !== id));
    toast.success('Activity log deleted');
  }, []);

  // Keep the columns stable so the table state does not reset on every render.
  const columns = useMemo(
    () => getActivityLogColumns({ onDelete: handleDelete }),
    [handleDelete]
  );

  const table = useReactTable({
    data: activityItems,
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
