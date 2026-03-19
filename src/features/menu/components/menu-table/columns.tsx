'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { RelativeTime } from '@/components/ui/relative-time';
import { CellAction } from './cell-action';
import type { MenuGroup } from '@/features/menu/types';

type TranslateFn = (key: string) => string;

export function getMenuColumns(t: TranslateFn): ColumnDef<MenuGroup>[] {
  // Build translated table columns in one place so the list page stays simple.
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.table.name')} />
      ),
      cell: ({ row }) => <span>{row.getValue('name')}</span>,
      enableColumnFilter: true,
      meta: {
        label: t('menu.table.name'),
        placeholder: t('menu.table.searchName'),
        variant: 'text'
      }
    },
    {
      accessorKey: 'slug',
      header: t('menu.table.slug'),
      cell: ({ row }) => (
        <code className='bg-muted rounded px-1.5 py-0.5 text-xs'>
          {row.getValue('slug')}
        </code>
      )
    },
    {
      id: 'items',
      accessorFn: (row) => row.items.length,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.table.items')} />
      ),
      cell: ({ cell }) => (
        <span className='text-muted-foreground'>{cell.getValue<number>()}</span>
      )
    },
    {
      accessorKey: 'isActive',
      header: t('menu.table.status'),
      cell: ({ row }) => {
        const isActive = row.getValue<boolean>('isActive');
        return (
          <Badge
            variant={isActive ? 'success' : 'secondary'}
            appearance='outline'
            className='gap-1'
          >
            {isActive ? (
              <IconCircleCheck className='h-3 w-3' />
            ) : (
              <IconCircleX className='h-3 w-3' />
            )}
            {isActive ? t('menu.table.active') : t('menu.table.inactive')}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('menu.table.created')}
        />
      ),
      cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />,
      enableHiding: false
    },
    {
      id: 'actions',
      header: t('menu.table.actions'),
      cell: ({ row }) => <CellAction data={row.original} />,
      enableHiding: false
    }
  ];
}
