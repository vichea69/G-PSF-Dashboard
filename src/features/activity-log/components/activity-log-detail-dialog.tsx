'use client';

import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { ActivityLogItem } from '../types';

type ActivityLogDetailDialogProps = {
  item: ActivityLogItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'dd/MM/yyyy HH:mm:ss');
}

function getEventMeta(event: ActivityLogItem['event']): {
  label: string;
  variant: 'success' | 'info' | 'destructive';
} {
  if (event === 'created') return { label: 'Created', variant: 'success' };
  if (event === 'deleted') return { label: 'Deleted', variant: 'destructive' };
  return { label: 'Updated', variant: 'info' };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-3'>
      <p className='text-muted-foreground text-sm font-medium'>{label}</p>
      <div className='text-sm'>{value}</div>
    </div>
  );
}

export function ActivityLogDetailDialog({
  item,
  open,
  onOpenChange
}: ActivityLogDetailDialogProps) {
  const event = getEventMeta(item.event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{item.activity}</DialogTitle>
          <DialogDescription>
            Review the full activity log information for this row.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <DetailRow
            label='Event'
            value={
              <Badge variant={event.variant} appearance='light' size='sm'>
                {event.label}
              </Badge>
            }
          />
          <DetailRow label='Module' value={item.module} />
          <DetailRow label='Target' value={item.targetLabel || '-'} />
          <DetailRow label='User' value={item.userName} />
          <DetailRow label='Email' value={item.userEmail || '-'} />
          <DetailRow label='Date' value={formatDateTime(item.date)} />
          <DetailRow label='Content' value={item.contentPath || '-'} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
