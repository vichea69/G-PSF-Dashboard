'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import {
  getLocalizedText,
  limitWords,
  type LocalizedText
} from '@/lib/helpers';
import { type Language } from '@/context/language-context';

export type SectionRow = {
  id: number | string;
  pageSlug?: string;
  blockType?: string;
  title?: LocalizedText;
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

const highlightMatch = (value: string, term?: string) => {
  const trimmed = (term ?? '').trim();
  if (!trimmed) return <span>{value}</span>;
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'ig');
  const parts = value.split(regex);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index}>{part}</span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export const getSectionColumns = (
  language: Language
): ColumnDef<SectionRow>[] => [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }: { column: Column<SectionRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID' />
    )
  },
  {
    id: 'title',
    accessorFn: (row) => getLocalizedText(row.title ?? '', language),
    header: ({ column }: { column: Column<SectionRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Section Title' />
    ),
    cell: ({ cell }) => {
      const value = (cell.getValue<string>() ?? '').toString();
      const raw = cell.column.getFilterValue() as string | undefined;
      const display = limitWords(value || 'Untitled', 8);
      return <div>{highlightMatch(display, raw)}</div>;
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
