'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/context/permission-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash
} from '@tabler/icons-react';

import { DeleteRole } from '@/server/action/admin/role';
import { RoleAPI } from '@/features/role/type/role';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { useTranslate } from '@/hooks/use-translate';
import { isSuperAdminRole } from '@/lib/super-admin';

interface RoleCellActionProps {
  role: RoleAPI;
}

const ROLES_QUERY_KEY = ['roles'] as const;

export function RoleCellAction({ role }: RoleCellActionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslate();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const editHref = useMemo(() => getRoleEditHref(role), [role]);
  const [openDelete, setOpenDelete] = useState(false);
  const canReadRole = can(
    adminRoutePermissions.roles.list.resource,
    adminRoutePermissions.roles.list.action
  );
  const canUpdateRole = can(
    adminRoutePermissions.roles.update.resource,
    adminRoutePermissions.roles.update.action
  );
  const canDeleteRole = can(
    adminRoutePermissions.roles.delete.resource,
    adminRoutePermissions.roles.delete.action
  );
  const isProtectedRole = isSuperAdminRole(role);
  const canManageRole = canUpdateRole && !isProtectedRole;
  const canRemoveRole = canDeleteRole && !isProtectedRole;
  // Protected roles still need a way to open the read-only details screen.
  const canViewRole = canReadRole && isProtectedRole;

  const deleteMutation = useMutation({
    mutationFn: async (roleId: number) => {
      await DeleteRole(roleId);
    },
    onSuccess: () => {
      toast.success(t('role.toast.deleted'));
      setOpenDelete(false);
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message ??
        (error as Error)?.message ??
        t('role.toast.deleteFailed');
      toast.error(message);
    }
  });

  const onDelete = useCallback(() => {
    if (!role.id) {
      toast.error(t('role.toast.idMissing'));
      return;
    }

    deleteMutation.mutate(Number(role.id));
  }, [deleteMutation, role.id, t]);

  const onManage = useCallback(() => {
    router.push(editHref);
  }, [editHref, router]);

  if (!canManageRole && !canRemoveRole && !canViewRole) {
    return null;
  }

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onDelete}
        loading={deleteMutation.isPending}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>{t('role.actions.openMenu')}</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{t('role.actions.menuLabel')}</DropdownMenuLabel>
          {canViewRole ? (
            <DropdownMenuItem onClick={onManage}>
              <IconEye className='mr-2 h-4 w-4 text-blue-500' />
              <span className='text-blue-500'>{t('table.view')}</span>
            </DropdownMenuItem>
          ) : null}
          {canManageRole ? (
            <DropdownMenuItem onClick={onManage}>
              <IconEdit className='mr-2 h-4 w-4 text-blue-500' />
              <span className='text-blue-500'>{t('role.actions.edit')}</span>
            </DropdownMenuItem>
          ) : null}
          {canRemoveRole ? (
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              <IconTrash className='mr-2 h-4 w-4 text-red-500' />
              <span className='text-red-500'>{t('role.actions.delete')}</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function getRoleEditHref(role: RoleAPI): string {
  const identifier =
    role.id !== undefined && role.id !== null && `${role.id}`.trim().length > 0
      ? `${role.id}`.trim()
      : slugify(role.slug || role.name);

  return `/admin/roles/${encodeURIComponent(identifier)}/edit`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}
