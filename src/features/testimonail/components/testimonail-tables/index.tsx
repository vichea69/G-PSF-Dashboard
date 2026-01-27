'use client';
import { useMemo, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  type Row,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useLanguage } from '@/context/language-context';
import { getTestimonialColumns, type TestimonialRow } from './culumns';

export function TestimonialTableList({ data }: { data: TestimonialRow[] }) {
  const router = useRouter();
  const { language } = useLanguage();
  const columns = useMemo(() => getTestimonialColumns(language), [language]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const handleRowClick = (
    row: Row<TestimonialRow>,
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
    const id = row.original?.id;
    if (id !== undefined && id !== null) {
      router.push(`/admin/testimonial/${id}`);
    }
  };

  return (
    <DataTable table={table} onRowClick={handleRowClick}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
