'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  type MenuGroup,
  type MenuItem,
  getMenuLabelText,
  toLocalizedLabel
} from '@/features/menu/types';
import { toast } from 'sonner';

type EditFormState = {
  label: {
    en: string;
    km: string;
  };
  url: string;
  parentId: string | null;
};

type EditMenuItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMenu: MenuGroup;
  item: MenuItem | null;
  loading?: boolean;
  onSubmit: (payload: {
    itemId: string;
    label: {
      en: string;
      km: string;
    };
    url: string;
    parentId: string | null;
  }) => void;
};

export function EditMenuItemDialog({
  open,
  onOpenChange,
  selectedMenu,
  item,
  loading = false,
  onSubmit
}: EditMenuItemDialogProps) {
  const [form, setForm] = useState<EditFormState>({
    label: { en: '', km: '' },
    url: '',
    parentId: null
  });

  useEffect(() => {
    if (!item) return;
    const label = toLocalizedLabel(item.label);
    setForm({
      label: {
        en: label.en,
        km: label.km
      },
      url: item.url ?? '',
      parentId: item.parentId ?? null
    });
  }, [item, open]);

  const availableParents = useMemo(() => {
    if (!item) return selectedMenu.items;
    return selectedMenu.items.filter((menuItem) => menuItem.id !== item.id);
  }, [item, selectedMenu.items]);

  const handleSubmit = () => {
    if (!item) return;

    const labelEn = form.label.en.trim();
    const labelKm = form.label.km.trim();
    const url = form.url.trim();

    if (!labelEn && !labelKm) {
      toast.error('Please enter at least one label (EN or KM).');
      return;
    }

    if (!url) {
      toast.error('URL is required.');
      return;
    }

    const isInternalPath = url.startsWith('/');
    const isAbsoluteUrl = /^https?:\/\//i.test(url);
    if (!isInternalPath && !isAbsoluteUrl) {
      toast.error('URL must start with "/" or "http(s)://".');
      return;
    }

    // Always send both languages to avoid backend replacing one with null.
    const normalizedLabel = {
      en: labelEn || labelKm,
      km: labelKm || labelEn
    };

    onSubmit({
      itemId: item.id,
      label: normalizedLabel,
      url,
      parentId: form.parentId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Update the label, URL, or parent of this item.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='editItemLabelEn'>Label (EN)</Label>
              <Input
                id='editItemLabelEn'
                value={form.label.en}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    label: { ...prev.label, en: event.target.value }
                  }))
                }
                placeholder='Home'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='editItemLabelKm'>Label (KM)</Label>
              <Input
                id='editItemLabelKm'
                value={form.label.km}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    label: { ...prev.label, km: event.target.value }
                  }))
                }
                placeholder='ទំព័រដើម'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='editItemUrl'>URL</Label>
            <Input
              id='editItemUrl'
              value={form.url}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, url: event.target.value }))
              }
              placeholder='/resources/policy-updates'
            />
          </div>

          <div className='space-y-1.5'>
            <Label>Parent Item</Label>
            <Select
              value={form.parentId ?? '__none__'}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  parentId: value === '__none__' ? null : value
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='No parent (top level)' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__none__'>No parent (top level)</SelectItem>
                {availableParents.map((menuItem) => (
                  <SelectItem key={menuItem.id} value={menuItem.id}>
                    {getMenuLabelText(menuItem.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='button' onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
