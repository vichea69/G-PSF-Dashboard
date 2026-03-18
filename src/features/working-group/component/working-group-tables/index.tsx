'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useLanguage } from '@/context/language-context';
import { useTranslate } from '@/hooks/use-translate';
import { getWorkingGroupColumns, type WorkingGroupRow } from './columns';

export function WorkingGroupTableList({ data }: { data: WorkingGroupRow[] }) {
  const { language } = useLanguage();
  const { t } = useTranslate();
  const columns = useMemo(
    () => getWorkingGroupColumns(language, t),
    [language, t]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <DataTable table={table}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
