'use client';
import * as React from 'react';
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { userColumns, type UserRow } from './columns';

export function UsersTable({ data }: { data: UserRow[] }) {
  const columns = useMemo(() => userColumns, []);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
