'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CategoryCellAction } from './cell-action';
import { RelativeTime } from '@/components/ui/relative-time';
import { Badge } from '@/components/ui/badge';

export type CategoryRow = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    displayName: string;
    email: string;
  };
};

export const categoryColumns: ColumnDef<CategoryRow>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ cell }) => (
      <div className='w-[80px]'>{cell.getValue<number>()}</div>
    )
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<CategoryRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category Title' />
    ),
    cell: ({ cell }) => <div>{(cell.getValue<string>() ?? '').toString()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search name...',
      variant: 'text'
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ cell }) => (
      <div className='max-w-[360px] truncate'>{cell.getValue<string>()}</div>
    )
  },
  {
    id: 'createdBy',
    accessorFn: (row) => row.createdBy?.displayName ?? '',
    header: 'Created By',
    cell: ({ cell }) => {
      const raw = (cell.getValue<string>() ?? '').trim();
      if (!raw) {
        return <span className='text-muted-foreground'>-</span>;
      }

      const role = raw.toLowerCase();
      const variant =
        role === 'admin'
          ? ('destructive' as const)
          : role === 'editor'
            ? ('info' as const)
            : ('primary' as const);

      return (
        <Badge
          variant={variant}
          appearance='light'
          size='sm'
          className='capitalize'
        >
          {raw}
        </Badge>
      );
    }
  },
  // {
  //   accessorKey: 'createdAt',
  //   header: 'Created At'
  // },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CategoryCellAction data={row.original} />
  }
];
