'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RelativeTime } from '@/components/ui/relative-time';
import { getLocalizedText } from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import type { WorkingGroupItem } from '@/server/action/working-group/working-group-type';
import { CellAction } from './cell-action';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';

export type WorkingGroupRow = WorkingGroupItem;

type TranslateFn = (key: string) => string;

const getStatusBadge = (status: string | undefined, t: TranslateFn) => {
  const normalized = status?.toLowerCase?.() ?? 'draft';
  const isPublished = normalized === 'published';
  const isDraft = normalized === 'draft';

  const label = isPublished
    ? t('workingGroup.status.published')
    : isDraft
      ? t('workingGroup.status.draft')
      : t('workingGroup.status.unknown');
  const variant = isPublished
    ? ('success' as const)
    : isDraft
      ? ('warning' as const)
      : ('secondary' as const);

  return (
    <Badge variant={variant} appearance='outline' className='gap-1'>
      {isPublished ? (
        <IconCircleCheck className='h-3 w-3' />
      ) : (
        <IconCircleX className='h-3 w-3' />
      )}{' '}
      {label}
    </Badge>
  );
};

export const getWorkingGroupColumns = (
  language: Language,
  t: TranslateFn
): ColumnDef<WorkingGroupRow>[] => [
  // {
  //   id: 'id',
  //   accessorKey: 'id',
  //   header: ({ column }: { column: Column<WorkingGroupRow, unknown> }) => (
  //     <DataTableColumnHeader column={column} title='ID' />
  //   )
  // },
  {
    id: 'iconUrl',
    accessorKey: 'iconUrl',
    header: t('workingGroup.columns.icon'),
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
            alt={
              getLocalizedText(row.original.title ?? '', language) ||
              t('workingGroup.columns.icon')
            }
            className='h-full w-full object-cover'
          />
        </div>
      );
    }
  },
  {
    id: 'title',
    accessorFn: (row) => getLocalizedText(row.title ?? '', language) ?? '',
    header: ({ column }: { column: Column<WorkingGroupRow, unknown> }) => (
      <DataTableColumnHeader
        column={column}
        title={t('workingGroup.columns.title')}
      />
    ),
    cell: ({ cell }) => (
      <TruncatedTooltipCell
        text={String(cell.getValue() ?? '')}
        widthClassName='block w-[8rem] truncate sm:w-[11rem] lg:w-[16rem]'
        tooltipClassName='max-w-[24rem] break-words'
        minLength={12}
      />
    ),
    meta: {
      label: t('workingGroup.filters.titleLabel'),
      placeholder: t('workingGroup.filters.searchTitle'),
      variant: 'text'
    }
  },
  {
    id: 'page',
    accessorFn: (row) =>
      getLocalizedText(row.page?.title ?? '', language) ?? row.page?.slug ?? '',
    header: t('workingGroup.columns.page'),
    cell: ({ cell }) => (
      <TruncatedTooltipCell
        text={String(cell.getValue() ?? '')}
        widthClassName='block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]'
        tooltipClassName='max-w-[20rem] break-all'
        minLength={12}
      />
    )
  },
  {
    accessorKey: 'status',
    header: t('workingGroup.columns.status'),
    cell: ({ cell }) => getStatusBadge(cell.getValue<string>(), t)
  },
  {
    accessorKey: 'orderIndex',
    header: t('workingGroup.columns.order')
  },
  {
    accessorKey: 'updatedAt',
    header: t('workingGroup.columns.updated'),
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    header: t('workingGroup.columns.actions'),
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
