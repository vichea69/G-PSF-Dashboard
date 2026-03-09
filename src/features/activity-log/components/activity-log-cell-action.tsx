'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEye,
  IconExternalLink,
  IconTrash
} from '@tabler/icons-react';
import type { ActivityLogItem } from '../types';
import { ActivityLogDetailDialog } from './activity-log-detail-dialog';

type ActivityLogCellActionProps = {
  item: ActivityLogItem;
  onDelete: (id: string) => void;
};

export function ActivityLogCellAction({
  item,
  onDelete
}: ActivityLogCellActionProps) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const handleOpenContent = () => {
    if (!item.contentPath) {
      toast.error('No content link for this log');
      return;
    }

    router.push(item.contentPath);
  };

  const handleDelete = () => {
    onDelete(item.id);
    setOpenDelete(false);
  };

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        loading={false}
      />

      <ActivityLogDetailDialog
        item={item}
        open={openDetail}
        onOpenChange={setOpenDetail}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' data-row-action>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpenDetail(true)}>
            <IconEye className='mr-2 h-4 w-4' /> View Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenContent}>
            <IconExternalLink className='mr-2 h-4 w-4' /> Open Content
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete Log
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
