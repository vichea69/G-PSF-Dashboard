'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical, IconExternalLink } from '@tabler/icons-react';
import type { ActivityLogItem } from '../types';
import { useTranslate } from '@/hooks/use-translate';

type ActivityLogCellActionProps = {
  item: ActivityLogItem;
};

export function ActivityLogCellAction({ item }: ActivityLogCellActionProps) {
  const router = useRouter();
  const { t } = useTranslate();

  const handleOpenContent = () => {
    if (!item.contentPath) {
      toast.error(t('activityLog.noContentLink'));
      return;
    }

    router.push(item.contentPath);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' data-row-action>
          <span className='sr-only'>{t('activityLog.menuLabel')}</span>
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>{t('activityLog.menuLabel')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleOpenContent}>
          <IconExternalLink className='mr-2 h-4 w-4' />{' '}
          {t('activityLog.openContent')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
