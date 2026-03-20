'use client';
import * as React from 'react';
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Can } from '@/context/permission-context';
import { getUserColumns, type UserRow } from './columns';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { UserUpsertDialog } from '../user-upsert-dialog';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { useTranslate } from '@/hooks/use-translate';

export function UsersTable({ data }: { data: UserRow[] }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | undefined>();
  const [openEdit, setOpenEdit] = useState(false);
  const { t } = useTranslate();
  const handleEditUser = useCallback((user: UserRow) => {
    setEditingUser(user);
    setOpenEdit(true);
  }, []);
  const handleEditDialogChange = useCallback((nextOpen: boolean) => {
    setOpenEdit(nextOpen);

    if (!nextOpen) {
      setEditingUser(undefined);
    }
  }, []);
  // Rebuild columns when the language changes so labels stay in sync.
  const columns = useMemo(
    () =>
      getUserColumns(t, {
        onEdit: handleEditUser
      }),
    [handleEditUser, t]
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <DataTable table={table}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table}>
          <Can
            resource={adminRoutePermissions.users.create.resource}
            action={adminRoutePermissions.users.create.action}
          >
            <Button size='sm' onClick={() => setOpenCreate(true)}>
              {t('user.addNew')}
            </Button>
          </Can>
        </DataTableToolbar>
      </div>
      <UserUpsertDialog
        mode='create'
        open={openCreate}
        onOpenChange={setOpenCreate}
      />
      <UserUpsertDialog
        mode='edit'
        open={openEdit}
        onOpenChange={handleEditDialogChange}
        initialData={editingUser}
      />
    </DataTable>
  );
}
