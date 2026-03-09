'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { RelativeTime } from '@/components/ui/relative-time';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
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

export const activityLogDefaultSorting = [{ id: 'date', desc: true }];

type ActivityLogColumnsOptions = {
  onDelete: (id: string) => void;
};

export function getActivityLogColumns({
  onDelete
}: ActivityLogColumnsOptions): ColumnDef<ActivityLogItem>[] {
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
        <div className='min-w-[14rem]'>
          <p>{row.original.activity}</p>
        </div>
      ),
      meta: {
        label: 'Activity',
        placeholder: 'Search activity...',
        variant: 'text'
      }
    },
    {
      accessorKey: 'module',
      header: 'Module',
      cell: ({ cell }) => (
        <span className='text-muted-foreground text-sm font-medium'>
          {String(cell.getValue<string>() ?? '-')}
        </span>
      )
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className='flex min-w-[14rem] items-center gap-3'>
            <Avatar className='h-9 w-9'>
              <AvatarImage
                src={resolveApiAssetUrl(item.userAvatar)}
                alt={item.userName}
              />
              <AvatarFallback>{getInitials(item.userName)}</AvatarFallback>
            </Avatar>

            <div className='space-y-0.5'>
              <p className='font-medium'>{item.userName}</p>
              <p className='text-muted-foreground text-xs'>
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
        <div className='min-w-[8rem]'>
          <RelativeTime value={row.original.date} />
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActivityLogCellAction item={row.original} onDelete={onDelete} />
      )
    }
  ];
}
