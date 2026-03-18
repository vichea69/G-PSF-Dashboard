'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import Link from 'next/link';
import { useState } from 'react';
import { IconDotsVertical, IconEye, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTranslate } from '@/hooks/use-translate';
import { useDeleteContact } from '@/features/contact/hook/use-contact';

export default function CellAction({ id }: { id: string }) {
  const deleteContactMutation = useDeleteContact();
  const { t } = useTranslate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onConfirm() {
    try {
      setLoading(true);
      await deleteContactMutation.mutateAsync(id);
      toast.success(t('contact.toast.deleted'));
      setOpen(false);
    } catch (error: any) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        t('contact.toast.deleteFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            aria-label={t('contact.actions.menuLabel')}
            data-row-action
            onClick={(event) => event.stopPropagation()}
          >
            <span className='sr-only'>{t('contact.actions.openMenu')}</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            align='end'
            sideOffset={8}
            className='z-[9999] w-44'
          >
            <DropdownMenuLabel>
              {t('contact.actions.menuLabel')}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className='cursor-pointer rounded-lg'>
              <Link
                href={`/admin/contact/${id}`}
                className='flex items-center gap-2'
                data-row-action
              >
                <IconEye className='h-4 w-4' />
                {t('contact.actions.view')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
              disabled={loading}
              className='text-destructive focus:text-destructive cursor-pointer rounded-lg'
              data-row-action
            >
              <IconTrash className='mr-2 h-4 w-4' />
              {t('contact.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </>
  );
}
