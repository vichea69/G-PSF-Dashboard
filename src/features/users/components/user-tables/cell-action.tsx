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
import { useState } from 'react';
import type { UserRow } from './columns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserUpsertDialog } from '../user-upsert-dialog';
import { deleteAdminUser } from '@/server/action/admin/admin';
import { useTranslate } from '@/hooks/use-translate';

interface CellActionProps {
  data: UserRow;
}

export function UsersCellAction({ data }: CellActionProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const qc = useQueryClient();
  const { t } = useTranslate();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateUser = can(
    adminRoutePermissions.users.update.resource,
    adminRoutePermissions.users.update.action
  );
  const canDeleteUser = can(
    adminRoutePermissions.users.delete.resource,
    adminRoutePermissions.users.delete.action
  );

  const deleteMutation = useMutation({
    mutationFn: async () => deleteAdminUser(String(data.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('user.toast.deleted'));
    },
    onError: (e: any) => {
      const detail = e?.response?.data;
      const msg =
        detail?.message ||
        detail?.error ||
        (typeof detail === 'string' ? detail : undefined) ||
        (typeof e?.message === 'string' ? e.message : undefined) ||
        t('user.toast.deleteFailed');
      toast.error(msg);
      // console.error('Delete user error', e?.response?.status, detail, e);
    }
  });

  const onConfirm = async () => {
    await deleteMutation.mutateAsync();
    setOpenDelete(false);
  };

  if (!canUpdateUser && !canDeleteUser) {
    return null;
  }

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirm}
        loading={deleteMutation.isPending}
      />

      <UserUpsertDialog
        mode='edit'
        open={openEdit}
        onOpenChange={setOpenEdit}
        initialData={data}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>{t('user.actions.openMenu')}</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{t('user.actions.menuLabel')}</DropdownMenuLabel>
          {canUpdateUser ? (
            <DropdownMenuItem onClick={() => setOpenEdit(true)}>
              <IconEdit className='mr-2 h-4 w-4 text-fuchsia-500' />
              <span className='text-fuchsia-500'>{t('user.actions.edit')}</span>
            </DropdownMenuItem>
          ) : null}

          {canDeleteUser ? (
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              <IconTrash className='mr-2 h-4 w-4 text-red-500' />
              <span className='text-red-500'>{t('user.actions.delete')}</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
