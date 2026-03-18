'use client';
import React, { useMemo } from 'react';
import {
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useTranslate } from '@/hooks/use-translate';
import { getLogoColumns } from './columns';
import { LogoType } from '@/features/logo/type/logo-type';

export function LogoTableList({ data }: { data: LogoType[] }) {
  const { t } = useTranslate();
  const columns = useMemo(() => getLogoColumns(t), [t]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters
    }
  });

  return (
    <DataTable table={table}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
