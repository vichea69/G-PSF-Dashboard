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
import { useTranslate } from '@/hooks/use-translate';

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
  const { t } = useTranslate();
  const title = force
    ? t('media.toolbar.deleteFolder')
    : `${t('media.toolbar.deleteFolder')}?`;
  const description = force
    ? `This will delete "${folderName || t('media.toolbar.selectedFolder')}" and all files inside. This action cannot be undone.`
    : `This will delete "${folderName || t('media.toolbar.selectedFolder')}". The folder must be empty.`;

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
            {t('media.createFolder.cancel')}
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={loading}
            onClick={() => onConfirm()}
          >
            {loading
              ? `${t('media.preview.delete')}...`
              : t('media.preview.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
