'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useLanguage } from '@/context/language-context';
import { getPostColumns, type PostRow } from './columns';

type PostTableListProps = {
  data: PostRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function PostTableList({
  data,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange
}: PostTableListProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const columns = useMemo(() => getPostColumns(language), [language]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize
      }
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({
              pageIndex: Math.max(0, page - 1),
              pageSize
            })
          : updater;

      const nextPage = next.pageIndex + 1;
      const nextSize = next.pageSize;

      if (nextSize !== pageSize) {
        onPageSizeChange(nextSize);
        onPageChange(1);
        return;
      }

      if (nextPage !== page) {
        onPageChange(nextPage);
      }
    }
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
