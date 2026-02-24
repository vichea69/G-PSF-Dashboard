'use client';

import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { menuColumns } from './columns';
import {
  CreateMenuDialog,
  type CreateMenuPayload
} from '@/features/menu/components/CreateMenuDialog';
import type { MenuGroup } from '@/features/menu/types';

interface MenuTableListProps {
  data: MenuGroup[];
  onCreate?: (payload: CreateMenuPayload) => void;
}

export function MenuTableList({ data, onCreate }: MenuTableListProps) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns: menuColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  return (
    <DataTable
      table={table}
      onRowClick={(row) => {
        router.push(`/admin/menu/${row.original.slug}`);
      }}
    >
      <DataTableToolbar table={table}>
        {onCreate && <CreateMenuDialog onCreate={onCreate} />}
      </DataTableToolbar>
    </DataTable>
  );
}
