'use client';

import { useRouter } from 'next/navigation';
import { usePermissions } from '@/context/permission-context';
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
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

interface MenuTableListProps {
  data: MenuGroup[];
  onCreate?: (payload: CreateMenuPayload) => void;
}

export function MenuTableList({ data, onCreate }: MenuTableListProps) {
  const router = useRouter();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateMenu = can(
    adminRoutePermissions.menu.update.resource,
    adminRoutePermissions.menu.update.action
  );
  const canCreateMenu = can(
    adminRoutePermissions.menu.create.resource,
    adminRoutePermissions.menu.create.action
  );

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
        if (!canUpdateMenu) return;
        router.push(`/admin/menu/${row.original.slug}`);
      }}
    >
      <DataTableToolbar table={table}>
        {onCreate && canCreateMenu ? (
          <CreateMenuDialog onCreate={onCreate} />
        ) : null}
      </DataTableToolbar>
    </DataTable>
  );
}
