'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/context/permission-context';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogoType } from '@/features/logo/type/logo-type';
import { useTranslate } from '@/hooks/use-translate';
import { deleteLogo } from '@/server/action/logo/logo';

interface CellActionProps {
  data: LogoType;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslate();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateLogo = can(
    adminRoutePermissions.logo.update.resource,
    adminRoutePermissions.logo.update.action
  );
  const canDeleteLogo = can(
    adminRoutePermissions.logo.delete.resource,
    adminRoutePermissions.logo.delete.action
  );

  if (!canUpdateLogo && !canDeleteLogo) {
    return null;
  }

  const onConfirm = async () => {
    try {
      setLoading(true);
      // Optimistic update
      qc.setQueryData(['logo'], (prev: any) => {
        if (!prev) return prev;
        const remove = (arr: any[]) =>
          arr.filter((p) => String(p?.id) !== String(data.id));
        if (Array.isArray(prev)) return remove(prev);
        if (Array.isArray(prev?.data?.logos))
          return {
            ...prev,
            data: { ...prev.data, logos: remove(prev.data.logos) }
          };
        if (Array.isArray(prev?.data))
          return { ...prev, data: remove(prev.data) };
        if (Array.isArray(prev?.items))
          return { ...prev, items: remove(prev.items) };
        return prev;
      });

      const result = await deleteLogo(String(data.id));
      if (!result.success) {
        throw new Error(result.error ?? t('logo.validation.deleteFailed'));
      }
      toast.success(t('logo.toast.deleted'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['logo'], exact: false });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        t('logo.validation.deleteFailed');
      toast.error(msg);
      qc.invalidateQueries({ queryKey: ['logo'], exact: false });
    } finally {
      setLoading(false);
    }
  };

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
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>{t('logo.actions.openMenu')}</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{t('logo.actions.menuLabel')}</DropdownMenuLabel>
          {canUpdateLogo ? (
            <DropdownMenuItem
              onClick={() => router.push(`/admin/logo/${data.id}/edit`)}
            >
              <IconEdit className='mr-2 h-4 w-4' /> {t('logo.actions.edit')}
            </DropdownMenuItem>
          ) : null}
          {canDeleteLogo ? (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <IconTrash className='mr-2 h-4 w-4' /> {t('logo.actions.delete')}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
