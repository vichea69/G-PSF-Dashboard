'use client';
import { useMemo, type MouseEvent } from 'react';
import { usePermissions } from '@/context/permission-context';
import {
  type Row,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useRouter } from 'next/navigation';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { categoryColumns, type CategoryRow } from './columns';

export function CategoriesTable({ data }: { data: CategoryRow[] }) {
  const router = useRouter();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateCategory = can(
    adminRoutePermissions.categories.update.resource,
    adminRoutePermissions.categories.update.action
  );
  const columns = useMemo(() => categoryColumns, []);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const handleRowClick = (
    row: Row<CategoryRow>,
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
    if (!canUpdateCategory) return;
    router.push(`/admin/category/${row.original.id}`);
  };

  return (
    <DataTable table={table} onRowClick={handleRowClick}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
