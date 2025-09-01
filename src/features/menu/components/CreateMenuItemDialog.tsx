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
import { MenuGroup } from '@/features/menu/types';

export interface CreateMenuItemPayload {
  label: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom' | 'external';
  parentId: string;
  openInNewTab: boolean;
}

interface CreateMenuItemDialogProps {
  selectedMenu: MenuGroup;
  onCreate: (payload: CreateMenuItemPayload) => void;
}

export function CreateMenuItemDialog({
  selectedMenu,
  onCreate
}: CreateMenuItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateMenuItemPayload>({
    label: '',
    url: '',
    type: 'page',
    parentId: '',
    openInNewTab: false
  });

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    onCreate(form);
    setForm({
      label: '',
      url: '',
      type: 'page',
      parentId: '',
      openInNewTab: false
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='itemLabel'>Label</Label>
            <Input
              id='itemLabel'
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder='Menu item label'
            />
          </div>
          <div>
            <Label htmlFor='itemUrl'>URL</Label>
            <Input
              id='itemUrl'
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder='/page-url or https://external.com'
            />
          </div>
          <div>
            <Label htmlFor='itemType'>Type</Label>
            <select
              id='itemType'
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as CreateMenuItemPayload['type']
                })
              }
              className='bg-background border-input w-full rounded-md border p-2'
            >
              <option value='page'>Page</option>
              <option value='post'>Post</option>
              <option value='category'>Category</option>
              <option value='custom'>Custom</option>
              <option value='external'>External</option>
            </select>
          </div>
          <div>
            <Label htmlFor='parentItem'>Parent Item</Label>
            <select
              id='parentItem'
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className='bg-background border-input w-full rounded-md border p-2'
            >
              <option value=''>No parent (top level)</option>
              {selectedMenu.items
                .filter((item) => !item.parentId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='openInNewTab'
              checked={form.openInNewTab}
              onChange={(e) =>
                setForm({ ...form, openInNewTab: e.target.checked })
              }
              className='rounded'
            />
            <Label htmlFor='openInNewTab'>Open in new tab</Label>
          </div>
          <Button onClick={handleSubmit} className='w-full'>
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
