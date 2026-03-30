'use client';

import { useMemo } from 'react';
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
import { useTranslate } from '@/hooks/use-translate';
import { getMenuColumns } from './columns';
import {
  CreateMenuDialog,
  type CreateMenuPayload
} from '@/features/menu/components/CreateMenuDialog';
import type { MenuGroup } from '@/features/menu/types';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

interface MenuTableListProps {
  data: MenuGroup[];
  onCreate?: (payload: CreateMenuPayload) => Promise<void>;
  createLoading?: boolean;
}

export function MenuTableList({
  data,
  onCreate,
  createLoading = false
}: MenuTableListProps) {
  const router = useRouter();
  const { t } = useTranslate();
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
  const columns = useMemo(() => getMenuColumns(t), [t]);

  const table = useReactTable({
    data,
    columns,
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
          <CreateMenuDialog onCreate={onCreate} loading={createLoading} />
        ) : null}
      </DataTableToolbar>
    </DataTable>
  );
}
