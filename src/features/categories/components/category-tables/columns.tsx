'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CategoryCellAction } from './cell-action';

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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<CategoryRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => {
      const value = (cell.getValue<string>() ?? '').toString();
      const raw = cell.column.getFilterValue() as string | undefined;
      const term = (raw ?? '').trim();
      if (!term) return <div>{value}</div>;
      const escapeRegExp = (s: string) =>
        s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
      const parts = value.split(regex);
      return (
        <div>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <span key={i} className='font-semibold text-green-600'>
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      );
    },
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
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CategoryCellAction data={row.original} />
  }
];
