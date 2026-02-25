'use client';

import { useMemo, type MouseEvent } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  useReactTable
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { contactColumns, type ContactRow } from './columns';

type ContactsTableProps = {
  data: ContactRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export default function ContactsTable({
  data,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange
}: ContactsTableProps) {
  const router = useRouter();
  const columns = useMemo(() => contactColumns, []);
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
      },
      sorting: [{ id: 'createdAt', desc: true }]
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
      const nextPageSize = next.pageSize;

      if (nextPageSize !== pageSize) {
        onPageSizeChange(nextPageSize);
        onPageChange(1);
        return;
      }

      if (nextPage !== page) {
        onPageChange(nextPage);
      }
    }
  });

  const handleRowClick = (
    row: Row<ContactRow>,
    event: MouseEvent<HTMLTableRowElement>
  ) => {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'button, a, input, textarea, select, [role="button"], [data-row-action]'
      )
    ) {
      return;
    }

    router.push(`/admin/contact/${row.original.id}`);
  };

  return (
    <DataTable table={table} onRowClick={handleRowClick}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
