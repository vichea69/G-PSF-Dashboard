'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';

export type SectionRow = {
  id: number | string;
  pageSlug?: string;
  blockType?: string;
  title?: string;
  data?: { headline?: string; subheadline?: string } | null;
  enabled?: boolean;
  orderIndex?: number;
  updatedAt?: string;
};

const getEnabledBadge = (enabled?: boolean) => {
  const isEnabled = Boolean(enabled);
  return (
    <Badge
      variant='outline'
      className={
        isEnabled
          ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
          : 'border-amber-200 bg-amber-100 text-amber-700'
      }
    >
      {isEnabled ? 'Enabled' : 'Disabled'}
    </Badge>
  );
};

export const sectionColumns: ColumnDef<SectionRow>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }: { column: Column<SectionRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID' />
    )
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<SectionRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Section Title' />
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
              <span key={i}>{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      );
    },
    meta: {
      label: 'Title',
      placeholder: 'Search title...',
      variant: 'text'
    }
  },
  {
    accessorKey: 'pageSlug',
    header: 'Page'
  },
  {
    accessorKey: 'blockType',
    header: 'Block Type'
  },
  {
    accessorKey: 'enabled',
    header: 'Status',
    cell: ({ cell }) => getEnabledBadge(cell.getValue<boolean>())
  },
  {
    accessorKey: 'orderIndex',
    header: 'Order'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original as any} />
  }
];
