'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export interface RenameMenuPayload {
  name: string;
}

interface RenameMenuDialogProps {
  currentName: string;
  loading?: boolean;
  onSubmit: (payload: RenameMenuPayload) => Promise<void>;
}

export function RenameMenuDialog({
  currentName,
  loading = false,
  onSubmit
}: RenameMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (!open) {
      setName(currentName);
    }
  }, [currentName, open]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName === currentName.trim()) {
      setOpen(false);
      return;
    }

    await onSubmit({ name: trimmedName });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Pencil className='mr-2 h-4 w-4' />
          Rename
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Menu</DialogTitle>
          <DialogDescription>
            Update the display name for this menu.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='menu-rename-name'>Menu Name</Label>
            <Input
              id='menu-rename-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Quick link'
              disabled={loading}
            />
          </div>

          <Button onClick={handleSubmit} className='w-full' disabled={loading}>
            Save Name
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
