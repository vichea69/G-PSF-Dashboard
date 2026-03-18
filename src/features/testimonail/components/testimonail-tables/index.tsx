'use client';
import { useMemo, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/context/permission-context';
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
import { useTranslate } from '@/hooks/use-translate';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getTestimonialColumns, type TestimonialRow } from './culumns';

export function TestimonialTableList({ data }: { data: TestimonialRow[] }) {
  const router = useRouter();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const { language } = useLanguage();
  const { t } = useTranslate();
  const canUpdateTestimonial = can(
    adminRoutePermissions.testimonials.update.resource,
    adminRoutePermissions.testimonials.update.action
  );
  const columns = useMemo(
    () => getTestimonialColumns(language, t),
    [language, t]
  );
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
    if (!canUpdateTestimonial) return;
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
