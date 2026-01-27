'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { getPostColumns, type PostRow } from './columns';

export function PostTableList({ data }: { data: PostRow[] }) {
  const router = useRouter();
  const { language } = useLanguage();
  const columns = useMemo(() => getPostColumns(language), [language]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <DataTable
      table={table}
      onRowClick={(row) => {
        const id = row.original?.id;
        if (id !== undefined && id !== null) {
          router.push(`/admin/post/${id}`);
        }
      }}
    >
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
