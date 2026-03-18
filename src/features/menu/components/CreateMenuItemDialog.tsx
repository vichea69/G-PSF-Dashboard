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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MenuGroup, getMenuLabelText } from '@/features/menu/types';
import { useTranslate } from '@/hooks/use-translate';
import { toast } from 'sonner';

export interface CreateMenuItemPayload {
  label: {
    en: string;
    km: string;
  };
  url: string;
  parentId: string | null;
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
  const { t } = useTranslate();
  const [form, setForm] = useState<CreateMenuItemPayload>({
    label: {
      en: '',
      km: ''
    },
    url: '',
    parentId: null
  });

  const handleSubmit = () => {
    const labelEn = form.label.en.trim();
    const labelKm = form.label.km.trim();
    const url = form.url.trim();

    if (!labelEn && !labelKm) {
      toast.error(t('menu.dialogs.labelRequired'));
      return;
    }

    if (!url) {
      toast.error(t('menu.dialogs.urlRequired'));
      return;
    }

    const isInternalPath = url.startsWith('/');
    const isAbsoluteUrl = /^https?:\/\//i.test(url);
    if (!isInternalPath && !isAbsoluteUrl) {
      toast.error(t('menu.dialogs.urlInvalid'));
      return;
    }

    onCreate({
      ...form,
      label: {
        en: labelEn,
        km: labelKm
      },
      url
    });
    setForm({
      label: {
        en: '',
        km: ''
      },
      url: '',
      parentId: null
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          {t('menu.dialogs.addItem')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('menu.dialogs.createItemTitle')}</DialogTitle>
          <DialogDescription>
            {t('menu.dialogs.createItemDescriptionPrefix')}{' '}
            <strong>{selectedMenu.name}</strong>{' '}
            {t('menu.dialogs.createItemDescriptionSuffix')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='itemLabelEn'>{t('menu.dialogs.labelEn')}</Label>
              <Input
                id='itemLabelEn'
                value={form.label.en}
                onChange={(e) =>
                  setForm({
                    ...form,
                    label: {
                      ...form.label,
                      en: e.target.value
                    }
                  })
                }
                placeholder='Home'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='itemLabelKm'>{t('menu.dialogs.labelKm')}</Label>
              <Input
                id='itemLabelKm'
                value={form.label.km}
                onChange={(e) =>
                  setForm({
                    ...form,
                    label: {
                      ...form.label,
                      km: e.target.value
                    }
                  })
                }
                placeholder='ទំព័រដើម'
              />
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='itemUrl'>{t('menu.dialogs.url')}</Label>
            <Input
              id='itemUrl'
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder={t('menu.dialogs.urlPlaceholder')}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>{t('menu.dialogs.parentItem')}</Label>
            <Select
              value={form.parentId ?? '__none__'}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  parentId: value === '__none__' ? null : value
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('menu.dialogs.noParent')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__none__'>
                  {t('menu.dialogs.noParent')}
                </SelectItem>
                {selectedMenu.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {getMenuLabelText(item.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className='w-full'>
            {t('menu.dialogs.addItem')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
