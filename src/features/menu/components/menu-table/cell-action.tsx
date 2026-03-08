'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
import { IconEdit, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useDeleteMenu } from '@/features/menu/hook/use-menu';
import type { MenuGroup } from '@/features/menu/types';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { toast } from 'sonner';

interface CellActionProps {
  data: MenuGroup;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const deleteMenuMutation = useDeleteMenu();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateMenu = can(
    adminRoutePermissions.menu.update.resource,
    adminRoutePermissions.menu.update.action
  );
  const canDeleteMenu = can(
    adminRoutePermissions.menu.delete.resource,
    adminRoutePermissions.menu.delete.action
  );

  if (!canUpdateMenu && !canDeleteMenu) {
    return null;
  }

  const onConfirm = () => {
    deleteMenuMutation.mutate(
      { menuId: data.id },
      {
        onSuccess: () => {
          toast.success('Menu deleted');
          setOpen(false);
          qc.invalidateQueries({ queryKey: ['menus'] });
          router.push('/admin/menu');
        },
        onError: (error) => {
          toast.error((error as Error)?.message ?? 'Failed to delete menu');
        }
      }
    );
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={deleteMenuMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={(event) => event.stopPropagation()}
          >
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {canUpdateMenu ? (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/admin/menu/${data.slug}`);
              }}
            >
              <IconEdit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
          ) : null}
          {canDeleteMenu ? (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setOpen(true);
              }}
            >
              <IconTrash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
