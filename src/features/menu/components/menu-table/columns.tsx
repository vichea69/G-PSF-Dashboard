'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { RelativeTime } from '@/components/ui/relative-time';
import { CellAction } from './cell-action';
import type { MenuGroup } from '@/features/menu/types';

export const menuColumns: ColumnDef<MenuGroup>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('name')}</span>
    ),
    enableColumnFilter: true,
    meta: { label: 'Name', placeholder: 'Search name...', variant: 'text' }
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <code className='bg-muted rounded px-1.5 py-0.5 text-xs'>
        {row.getValue('slug')}
      </code>
    )
  },
  // {
  //   accessorKey: 'location',
  //   header: 'Location',
  //   cell: ({ row }) => {
  //     const location = row.getValue<string>('location');
  //     return (
  //       <Badge variant='outline' size='sm'>
  //         {location}
  //       </Badge>
  //     );
  //   }
  // },
  {
    id: 'items',
    accessorFn: (row) => row.items.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ cell }) => (
      <span className='text-muted-foreground'>{cell.getValue<number>()}</span>
    )
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
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
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />,
    enableHiding: false
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />,
    enableHiding: false
  }
];
