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
import { userColumns, type UserRow } from './columns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { UserUpsertDialog } from '../user-upsert-dialog';

export function UsersTable({ data }: { data: UserRow[] }) {
  const [openCreate, setOpenCreate] = useState(false);
  const columns = useMemo(() => userColumns, []);
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
          <Button size='sm' onClick={() => setOpenCreate(true)}>
            Add User
          </Button>
        </DataTableToolbar>
      </div>
      <UserUpsertDialog
        mode='create'
        open={openCreate}
        onOpenChange={setOpenCreate}
      />
    </DataTable>
  );
}
