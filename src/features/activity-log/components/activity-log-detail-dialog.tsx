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
import { useTranslate } from '@/hooks/use-translate';

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
} & { key: string } {
  if (event === 'created') {
    return { key: 'activityLog.created', label: 'Created', variant: 'success' };
  }
  if (event === 'deleted') {
    return {
      key: 'activityLog.deleted',
      label: 'Deleted',
      variant: 'destructive'
    };
  }
  return { key: 'activityLog.updated', label: 'Updated', variant: 'info' };
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
  const { t } = useTranslate();
  const event = getEventMeta(item.event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{item.activity}</DialogTitle>
          <DialogDescription>
            {t('activityLog.detailDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <DetailRow
            label={t('activityLog.event')}
            value={
              <Badge variant={event.variant} appearance='light' size='sm'>
                {t(event.key)}
              </Badge>
            }
          />
          <DetailRow label={t('activityLog.module')} value={item.module} />
          <DetailRow label={t('activityLog.user')} value={item.userName} />
          <DetailRow
            label={t('activityLog.email')}
            value={item.userEmail || '-'}
          />
          <DetailRow
            label={t('activityLog.date')}
            value={formatDateTime(item.date)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
