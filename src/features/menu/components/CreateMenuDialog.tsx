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
import { useTranslate } from '@/hooks/use-translate';
import { Plus } from 'lucide-react';

export interface CreateMenuPayload {
  name: string;
}

interface CreateMenuDialogProps {
  onCreate: (payload: CreateMenuPayload) => Promise<void>;
  loading?: boolean;
}

export function CreateMenuDialog({
  onCreate,
  loading = false
}: CreateMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslate();
  const [form, setForm] = useState<CreateMenuPayload>({
    name: ''
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    try {
      await onCreate({ name: form.name.trim() });
      setForm({ name: '' });
      setOpen(false);
    } catch {
      // Keep the dialog open so the user can fix and retry.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='primary' size='sm' disabled={loading}>
          <Plus className='mr-1.5 h-3.5 w-3.5' />
          {t('menu.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('menu.dialogs.createMenuTitle')}</DialogTitle>
          <DialogDescription>
            {t('menu.dialogs.createMenuDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='menuName'>{t('menu.dialogs.menuSlug')}</Label>
            <Input
              id='menuName'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('menu.dialogs.menuSlugPlaceholder')}
              disabled={loading}
            />
            <p className='text-muted-foreground text-xs'>
              {t('menu.dialogs.menuSlugHint')}{' '}
              <code className='bg-muted rounded px-1 py-0.5 text-[11px]'>
                main-nav
              </code>
            </p>
          </div>
          <Button onClick={handleSubmit} className='w-full' disabled={loading}>
            {loading
              ? t('menu.dialogs.saving')
              : t('menu.dialogs.createMenuButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
