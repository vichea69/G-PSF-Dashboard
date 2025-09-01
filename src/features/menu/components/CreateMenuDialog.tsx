'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
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
  location: string;
  description: string;
}

interface CreateMenuDialogProps {
  onCreate: (payload: CreateMenuPayload) => void;
}

export function CreateMenuDialog({ onCreate }: CreateMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateMenuPayload>({
    name: '',
    location: '',
    description: ''
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate(form);
    setForm({ name: '', location: '', description: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Plus className='mr-2 h-4 w-4' />
          New Menu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Menu</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='menuName'>Menu Name</Label>
            <Input
              id='menuName'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder='Main Navigation'
            />
          </div>
          <div>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder='header, footer, sidebar'
            />
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Input
              id='description'
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder='Menu description'
            />
          </div>
          <Button onClick={handleSubmit} className='w-full'>
            Create Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
