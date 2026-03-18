'use client';
import * as React from 'react';
import { type Column, type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RelativeTime } from '@/components/ui/relative-time';
import { RoleCellAction } from './cell-action';
import { RoleAPI } from '@/features/role/type/role';

type TranslateFn = (key: string) => string;

export function getRoleColumns(t: TranslateFn): ColumnDef<RoleAPI>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
        <DataTableColumnHeader column={column} title={t('role.columns.role')} />
      ),
      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>
            <Badge variant='info' appearance='light'>
              {highlightMatch(row.original.name)}
            </Badge>
          </div>
        );
      },
      meta: {
        label: t('role.filters.roleLabel'),
        placeholder: t('role.filters.searchRole'),
        variant: 'text'
      },
      enableHiding: false
    },

    {
      id: 'type',
      accessorFn: (role) => (role.isSystem ? 'system' : 'custom'),
      header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
        <DataTableColumnHeader column={column} title={t('role.columns.type')} />
      ),
      cell: ({ row }) => {
        const isSystem = row.original.isSystem;
        return (
          <Badge
            variant={isSystem ? 'secondary' : 'destructive'}
            appearance='light'
            size='sm'
            className='font-medium capitalize'
          >
            {isSystem ? t('role.type.system') : t('role.type.custom')}
          </Badge>
        );
      }
    },
    {
      id: 'status',
      accessorFn: (role) => (role.isActive ? 'active' : 'inactive'),
      header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('role.columns.status')}
        />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant={isActive ? 'success' : 'destructive'}
            appearance='outline'
            size='sm'
            className='font-medium'
          >
            {isActive ? t('role.status.active') : t('role.status.inactive')}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'permissionsCount',
      header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('role.columns.permissions')}
        />
      ),
      cell: ({ cell }) => {
        const count = cell.getValue<number>() ?? 0;
        return (
          <Badge
            variant='primary'
            appearance='outline'
            size='sm'
            className='font-mono'
          >
            {count}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'resourcesCount',
      header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('role.columns.resources')}
        />
      ),
      cell: ({ cell }) => {
        const count = cell.getValue<number>() ?? 0;
        return (
          <Badge
            variant='primary'
            appearance='light'
            size='sm'
            className='font-mono'
          >
            {count}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('role.columns.updated')}
        />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue<string>();
        if (!value) {
          return <span className='text-muted-foreground text-sm'>—</span>;
        }

        return <RelativeTime value={value} className='text-sm' />;
      },
      enableHiding: false
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <RoleCellAction role={row.original} />,
      enableHiding: false
    }
  ];
}

function highlightMatch(value: string, query?: string): React.ReactNode {
  const term = query?.trim();
  if (!term) return value;

  const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
  const parts = value.split(regex);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={`match-${index}`} className='text-primary font-semibold'>
        {part}
      </span>
    ) : (
      <React.Fragment key={`text-${index}`}>{part}</React.Fragment>
    )
  );
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
