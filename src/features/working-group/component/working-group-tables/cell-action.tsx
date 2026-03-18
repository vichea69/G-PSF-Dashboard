'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
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
import { useTranslate } from '@/hooks/use-translate';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { deleteWorkingGroup } from '@/server/action/working-group/working-group';
import type { WorkingGroupRow } from './columns';

interface CellActionProps {
  data: WorkingGroupRow;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslate();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateWorkingGroup = can(
    adminRoutePermissions.workingGroups.update.resource,
    adminRoutePermissions.workingGroups.update.action
  );
  const canDeleteWorkingGroup = can(
    adminRoutePermissions.workingGroups.delete.resource,
    adminRoutePermissions.workingGroups.delete.action
  );

  const onConfirm = async () => {
    try {
      setLoading(true);
      qc.setQueryData(['working-groups'], (prev: any) => {
        if (!prev) return prev;
        const remove = (arr: any[]) =>
          arr.filter((item) => String(item?.id) !== String(data.id));
        if (Array.isArray(prev)) return remove(prev);
        if (Array.isArray(prev?.data))
          return { ...prev, data: remove(prev.data) };
        if (Array.isArray(prev?.items))
          return { ...prev, items: remove(prev.items) };
        return prev;
      });

      await deleteWorkingGroup(data.id);
      toast.success(t('workingGroup.toast.deleted'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['working-groups'], exact: false });
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('workingGroup.toast.deleteFailed');
      toast.error(message);
      qc.invalidateQueries({ queryKey: ['working-groups'], exact: false });
    } finally {
      setLoading(false);
    }
  };

  if (!canUpdateWorkingGroup && !canDeleteWorkingGroup) {
    return null;
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
            data-row-action
            onClick={(event) => event.stopPropagation()}
          >
            <span className='sr-only'>
              {t('workingGroup.actions.openMenu')}
            </span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>
            {t('workingGroup.actions.menuLabel')}
          </DropdownMenuLabel>
          {canUpdateWorkingGroup ? (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/admin/working-group/${data.id}`);
              }}
            >
              <IconEdit className='mr-2 h-4 w-4' />{' '}
              {t('workingGroup.actions.edit')}
            </DropdownMenuItem>
          ) : null}
          {canDeleteWorkingGroup ? (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
            >
              <IconTrash className='mr-2 h-4 w-4' />{' '}
              {t('workingGroup.actions.delete')}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
