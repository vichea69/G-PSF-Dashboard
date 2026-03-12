'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { getLocalizedText, type LocalizedText } from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import { RelativeTime } from '@/components/ui/relative-time';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import type { Option } from '@/types/data-table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';

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
      variant={isEnabled ? 'success' : 'warning'}
      appearance='outline'
      className='gap-1'
    >
      {isEnabled ? (
        <IconCircleCheck className='h-3 w-3' />
      ) : (
        <IconCircleX className='h-3 w-3' />
      )}{' '}
      {isEnabled ? 'Enabled' : 'Disabled'}
    </Badge>
  );
};

export const getSectionColumns = (
  language: Language,
  pageOptions: Option[]
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
      return (
        <TruncatedTooltipCell
          text={value}
          widthClassName='block w-[8rem] truncate sm:w-[11rem] lg:w-[16rem]'
          tooltipClassName='max-w-[24rem] break-words'
          minLength={12}
          fallback='Untitled'
        />
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
    header: 'Page',
    filterFn: (row, columnId, filterValue) => {
      const selectedValue = Array.isArray(filterValue)
        ? filterValue[0]
        : filterValue;

      if (!selectedValue) return true;

      return (
        String(row.getValue(columnId) ?? '').trim() ===
        String(selectedValue).trim()
      );
    },
    cell: ({ cell }) => {
      const value = String(cell.getValue<string>() ?? '').trim();
      if (!value) return <span className='text-muted-foreground'>-</span>;

      const content = (
        <div className='block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]'>
          {value}
        </div>
      );

      if (value.length <= 12) {
        return content;
      }

      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent className='max-w-[20rem] break-all'>
            {value}
          </TooltipContent>
        </Tooltip>
      );
    },
    meta: pageOptions.length
      ? {
          label: 'Page',
          variant: 'select',
          options: pageOptions
        }
      : undefined
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
  // {
  //   accessorKey: 'orderIndex',
  //   header: 'Order'
  // },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>() ?? ''} />
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original as any} />
  }
];
