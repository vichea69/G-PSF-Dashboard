'use client';

import { useState } from 'react';
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
import { Plus } from 'lucide-react';

export interface CreateMenuPayload {
  name: string;
}

interface CreateMenuDialogProps {
  onCreate: (payload: CreateMenuPayload) => void;
}

export function CreateMenuDialog({ onCreate }: CreateMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateMenuPayload>({
    name: ''
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate({ name: form.name.trim() });
    setForm({ name: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='primary' size='sm'>
          <Plus className='mr-1.5 h-3.5 w-3.5' />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Menu</DialogTitle>
          <DialogDescription>
            Enter a slug identifier for the new navigation menu.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='menuName'>Menu Slug</Label>
            <Input
              id='menuName'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder='main-nav or footer-links'
            />
            <p className='text-muted-foreground text-xs'>
              Lowercase with hyphens, e.g.{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-[11px]'>
                main-nav
              </code>
            </p>
          </div>
          <Button onClick={handleSubmit} className='w-full'>
            Create Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
