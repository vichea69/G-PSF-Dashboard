'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RelativeTime } from '@/components/ui/relative-time';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import CellAction from './cell-action';

export type ContactRow = {
  id: string | number;
  name: string;
  email: string;
  organisationName?: string;
  subject: string;
  message?: string;
  isRead: boolean;
  createdAt?: string;
};

type TranslateFn = (key: string) => string;

const contactStatusBadge = (isRead: boolean, t: TranslateFn) => (
  <Badge
    variant={isRead ? 'success' : 'warning'}
    appearance='outline'
    className='gap-1'
  >
    {isRead ? (
      <IconCircleCheck className='h-3 w-3' />
    ) : (
      <IconCircleX className='h-3 w-3' />
    )}{' '}
    {isRead ? t('contact.status.read') : t('contact.status.unread')}
  </Badge>
);

export function getContactColumns(t: TranslateFn): ColumnDef<ContactRow>[] {
  // Build the translated columns in one place so the table stays easy to read.
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<ContactRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('contact.columns.name')}
        />
      ),
      cell: ({ cell }) => (
        <span className='font-medium'>{cell.getValue<string>()}</span>
      ),
      enableColumnFilter: true,
      meta: {
        label: t('contact.filters.nameLabel'),
        placeholder: t('contact.filters.searchName'),
        variant: 'text'
      }
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }: { column: Column<ContactRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('contact.columns.email')}
        />
      ),
      enableColumnFilter: false
    },
    {
      id: 'organisationName',
      accessorKey: 'organisationName',
      header: t('contact.columns.organisation'),
      cell: ({ cell }) => cell.getValue<string>() || '-',
      enableColumnFilter: false
    },
    {
      id: 'subject',
      accessorKey: 'subject',
      header: ({ column }: { column: Column<ContactRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('contact.columns.subject')}
        />
      ),
      cell: ({ cell }) => (
        <span className='block max-w-[24rem] truncate'>
          {cell.getValue<string>()}
        </span>
      ),
      enableColumnFilter: false
    },
    {
      id: 'isRead',
      accessorFn: (row) => row.isRead,
      header: ({ column }: { column: Column<ContactRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('contact.columns.status')}
        />
      ),
      cell: ({ row }) => contactStatusBadge(Boolean(row.original.isRead), t),
      enableColumnFilter: false
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }: { column: Column<ContactRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('contact.columns.received')}
        />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? <RelativeTime value={value} /> : '-';
      },
      enableColumnFilter: false
    },
    {
      id: 'actions',
      header: t('contact.columns.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => <CellAction id={String(row.original.id)} />
    }
  ];
}
