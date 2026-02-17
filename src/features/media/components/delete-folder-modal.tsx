'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DeleteFolderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  folderName?: string;
  force?: boolean;
};

export function DeleteFolderModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  folderName,
  force = false
}: DeleteFolderModalProps) {
  const title = force ? 'Delete Folder' : 'Delete Folder?';
  const description = force
    ? `This will delete "${folderName || 'this folder'}" and all files inside. This action cannot be undone.`
    : `This will delete "${folderName || 'this folder'}". The folder must be empty.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={loading}
            onClick={() => onConfirm()}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
