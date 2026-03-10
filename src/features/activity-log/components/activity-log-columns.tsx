'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { RelativeTime } from '@/components/ui/relative-time';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';
import type { ActivityLogEvent, ActivityLogItem } from '../types';
import { ActivityLogCellAction } from './activity-log-cell-action';

type ActivityEventBadgeMeta = {
  label: string;
  variant: 'success' | 'info' | 'destructive';
};

function getActivityEventBadge(
  event: ActivityLogEvent
): ActivityEventBadgeMeta {
  if (event === 'created') {
    return { label: 'Created', variant: 'success' };
  }

  if (event === 'deleted') {
    return { label: 'Deleted', variant: 'destructive' };
  }

  return { label: 'Updated', variant: 'info' };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return 'NA';
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

function formatContentPath(value: string) {
  const path = String(value ?? '').trim();
  if (!path) return '';
  return path.replace(/^\/admin/, '') || '/';
}

export const activityLogDefaultSorting = [{ id: 'date', desc: true }];

export function getActivityLogColumns(): ColumnDef<ActivityLogItem>[] {
  return [
    {
      accessorKey: 'event',
      header: 'Event',
      cell: ({ row }) => {
        const badge = getActivityEventBadge(row.original.event);

        return (
          <Badge variant={badge.variant} appearance='outline' size='sm'>
            <BadgeDot />
            {badge.label}
          </Badge>
        );
      }
    },
    {
      id: 'activity',
      accessorFn: (row) =>
        [
          row.activity,
          row.module,
          row.contentPath,
          row.userName,
          row.userEmail,
          row.targetLabel,
          row.targetType
        ]
          .join(' ')
          .trim(),
      header: ({ column }: { column: Column<ActivityLogItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Activity' />
      ),
      cell: ({ row }) => (
        <TruncatedTooltipCell
          text={row.original.activity}
          widthClassName='block w-[9rem] truncate sm:w-[12rem] lg:w-[10rem]'
          tooltipClassName='max-w-[24rem] break-words'
          minLength={18}
        />
      ),
      meta: {
        label: 'Activity',
        placeholder: 'Search activity...',
        variant: 'text'
      }
    },
    // {
    //   accessorKey: 'module',
    //   header: 'Module',
    //   cell: ({ row }) => (
    //     <span className='text-muted-foreground text-sm'>
    //       {row.original.module || '-'}
    //     </span>
    //   )
    // },
    {
      accessorKey: 'targetLabel',
      header: 'Target',
      cell: ({ row }) => (
        <TruncatedTooltipCell
          text={row.original.targetLabel}
          widthClassName='block w-[4rem] truncate sm:w-[5rem] lg:w-[4rem]'
          tooltipClassName='max-w-[20rem] break-words'
          minLength={14}
        />
      )
    },
    {
      id: 'content',
      accessorFn: (row) => formatContentPath(row.contentPath),
      header: 'Content',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm break-all'>
          {formatContentPath(row.original.contentPath) || '-'}
        </span>
      )
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className='flex min-w-[10rem] items-center gap-2 sm:min-w-[13rem] sm:gap-3'>
            <Avatar className='h-8 w-8 sm:h-9 sm:w-9'>
              <AvatarImage
                src={resolveApiAssetUrl(item.userAvatar)}
                alt={item.userName}
              />
              <AvatarFallback>{getInitials(item.userName)}</AvatarFallback>
            </Avatar>

            <div className='space-y-0.5'>
              <p className='font-medium'>{item.userName}</p>
              <p className='text-muted-foreground hidden text-xs sm:block'>
                {item.userEmail || '-'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'date',
      header: ({ column }: { column: Column<ActivityLogItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Date' />
      ),
      cell: ({ row }) => (
        <div className='min-w-[7rem] text-sm'>
          <RelativeTime value={row.original.date} className='text-sm' />
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <ActivityLogCellAction item={row.original} />
    }
  ];
}
