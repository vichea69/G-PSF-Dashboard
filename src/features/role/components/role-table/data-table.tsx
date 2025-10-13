'use client';
import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

import { DataTable as BaseDataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { RoleAPI } from '@/features/role/type/role';

interface DataTableProps {
  data: RoleAPI[];
  columns: ColumnDef<RoleAPI, unknown>[];
  onCreate?: () => void;
}

export function DataTable({ data, columns, onCreate }: DataTableProps) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const handleCreate = React.useCallback(() => {
    if (onCreate) {
      onCreate();
      return;
    }
    router.push('/admin/roles/create');
  }, [onCreate, router]);

  return (
    <BaseDataTable table={table}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table}>
          <Button size='sm' className='gap-1.5' onClick={handleCreate}>
            New Role
          </Button>
        </DataTableToolbar>
      </div>
    </BaseDataTable>
  );
}
