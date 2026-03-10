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

type ActivityLogCellActionProps = {
  item: ActivityLogItem;
};

export function ActivityLogCellAction({ item }: ActivityLogCellActionProps) {
  const router = useRouter();

  const handleOpenContent = () => {
    if (!item.contentPath) {
      toast.error('No content link for this log');
      return;
    }

    router.push(item.contentPath);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' data-row-action>
          <span className='sr-only'>Open menu</span>
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleOpenContent}>
          <IconExternalLink className='mr-2 h-4 w-4' /> Open Content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
