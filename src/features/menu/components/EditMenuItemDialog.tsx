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
import {
  getDescendantIds,
  wouldCreateMenuCycle
} from '@/features/menu/utils/reorder';
import { useTranslate } from '@/hooks/use-translate';
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
  const { t, language } = useTranslate();

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
    const blockedIds = getDescendantIds(selectedMenu.items, item.id);
    return selectedMenu.items.filter(
      (menuItem) => menuItem.id !== item.id && !blockedIds.has(menuItem.id)
    );
  }, [item, selectedMenu.items]);

  const handleSubmit = () => {
    if (!item) return;

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

    if (wouldCreateMenuCycle(selectedMenu.items, item.id, form.parentId)) {
      toast.error(t('menu.toast.invalidParent'));
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
          <DialogTitle>{t('menu.dialogs.editItemTitle')}</DialogTitle>
          <DialogDescription>
            {t('menu.dialogs.editItemDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='editItemLabelEn'>
                {t('menu.dialogs.labelEn')}
              </Label>
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
              <Label htmlFor='editItemLabelKm'>
                {t('menu.dialogs.labelKm')}
              </Label>
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
            <Label htmlFor='editItemUrl'>{t('menu.dialogs.url')}</Label>
            <Input
              id='editItemUrl'
              value={form.url}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, url: event.target.value }))
              }
              placeholder={t('menu.dialogs.urlEditPlaceholder')}
            />
          </div>

          <div className='space-y-1.5'>
            <Label>{t('menu.dialogs.parentItem')}</Label>
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
                <SelectValue placeholder={t('menu.dialogs.noParent')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__none__'>
                  {t('menu.dialogs.noParent')}
                </SelectItem>
                {availableParents.map((menuItem) => (
                  <SelectItem key={menuItem.id} value={menuItem.id}>
                    {getMenuLabelText(menuItem.label, language)}
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
              {t('menu.dialogs.cancel')}
            </Button>
            <Button type='button' onClick={handleSubmit} disabled={loading}>
              {loading ? t('menu.dialogs.saving') : t('menu.dialogs.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
