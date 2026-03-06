'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { useLanguage } from '@/context/language-context';
import { getPostColumns, type PostRow } from './columns';
import { Input } from '@/components/ui/input';

type PostTableListProps = {
  data: PostRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function PostTableList({
  data,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange
}: PostTableListProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const columns = useMemo(() => getPostColumns(language), [language]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      <div className='flex w-full items-center justify-between gap-2 p-1'>
        <Input
          placeholder='Search posts...'
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className='h-8 w-[12rem] lg:w-[20rem]'
        />
        <DataTableViewOptions table={table} />
      </div>
    </DataTable>
  );
}
