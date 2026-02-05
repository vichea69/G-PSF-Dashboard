'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RelativeTime } from '@/components/ui/relative-time';
import { getLocalizedText } from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import type { WorkingGroupItem } from '@/server/action/working-group/working-group-type';
import { CellAction } from './cell-action';

export type WorkingGroupRow = WorkingGroupItem;

const getStatusBadge = (status?: string) => {
  const normalized = status?.toLowerCase?.() ?? 'draft';
  const isPublished = normalized === 'published';
  const isDraft = normalized === 'draft';

  const label = isPublished
    ? 'Published'
    : isDraft
      ? 'Draft'
      : (status ?? 'N/A');
  const className = isPublished
    ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
    : isDraft
      ? 'border-amber-200 bg-amber-100 text-amber-700'
      : 'border-slate-200 bg-slate-100 text-slate-700';

  return (
    <Badge variant='outline' className={className}>
      {label}
    </Badge>
  );
};

export const getWorkingGroupColumns = (
  language: Language
): ColumnDef<WorkingGroupRow>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }: { column: Column<WorkingGroupRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID' />
    )
  },
  {
    id: 'iconUrl',
    accessorKey: 'iconUrl',
    header: 'Icon',
    cell: ({ row }) => {
      const src = (row.original.iconUrl ?? '').trim();
      if (!src) {
        return <div className='bg-muted h-16 w-16 rounded-md border' />;
      }

      return (
        <div className='h-16 w-16 overflow-hidden rounded-md border'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={getLocalizedText(row.original.title ?? '', language) || 'icon'}
            className='h-full w-full object-cover'
          />
        </div>
      );
    }
  },
  {
    id: 'title',
    accessorFn: (row) =>
      getLocalizedText(row.title ?? row.name ?? '', language) ?? '',
    header: ({ column }: { column: Column<WorkingGroupRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    meta: {
      label: 'Title',
      placeholder: 'Search title...',
      variant: 'text'
    }
  },
  {
    id: 'page',
    accessorFn: (row) =>
      getLocalizedText(row.page?.title ?? '', language) ?? row.page?.slug ?? '',
    header: 'Page'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => getStatusBadge(cell.getValue<string>())
  },
  {
    accessorKey: 'orderIndex',
    header: 'Order'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
