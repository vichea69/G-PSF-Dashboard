'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type CreateFolderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (folderName: string) => Promise<void> | void;
};

export function CreateFolderModal({
  open,
  onOpenChange,
  onCreate
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFolderName('');
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      toast.error('Folder name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(trimmedName);
      onOpenChange(false);
    } catch {
      // Keep dialog open so user can retry.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            Enter a folder name to organize your media files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='folder-name'>Folder Name</Label>
            <Input
              id='folder-name'
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder='Example: Reports 2026'
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
