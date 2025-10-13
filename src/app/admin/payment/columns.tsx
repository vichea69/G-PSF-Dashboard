'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { RoleAPI } from '@/features/role/type/role';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { RelativeTime } from '@/components/ui/relative-time';
import * as React from 'react';

export const columns: ColumnDef<RoleAPI>[] = [
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row, column }) => {
      const filterValue = column.getFilterValue() as string | undefined;
      return (
        <div className='text-left font-medium'>
          <Badge variant='info' appearance='light'>
            {highlightMatch(row.original.name, filterValue)}
          </Badge>
        </div>
      );
    },
    meta: {
      label: 'Role',
      placeholder: 'Search role',
      variant: 'text'
    },
    enableHiding: false
  },
  {
    accessorKey: 'permissionsCount',
    header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
      <DataTableColumnHeader column={column} title='Permissions' />
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
    },
    enableHiding: false
  },
  {
    accessorKey: 'resourcesCount',
    header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
      <DataTableColumnHeader column={column} title='Resources' />
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
    },
    enableHiding: false
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }: { column: Column<RoleAPI, unknown> }) => (
      <DataTableColumnHeader column={column} title='Updated' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      if (!value) {
        return <span className='text-muted-foreground text-sm'>—</span>;
      }

      return <RelativeTime value={value} className='text-sm' />;
    },
    enableHiding: false
  }
];

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
