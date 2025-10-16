'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';

import { DeleteRole } from '@/server/action/admin/role';
import { RoleAPI } from '@/features/role/type/role';

interface RoleCellActionProps {
  role: RoleAPI;
}

const ROLES_QUERY_KEY = ['roles'] as const;

export function RoleCellAction({ role }: RoleCellActionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editHref = useMemo(() => getRoleEditHref(role), [role]);
  const [openDelete, setOpenDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (roleId: number) => {
      await DeleteRole(roleId);
    },
    onSuccess: () => {
      toast.success(`Role "${role.name}" deleted successfully`);
      setOpenDelete(false);
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message =
        (error as any)?.response?.data?.message ??
        (error as Error)?.message ??
        'Failed to delete role';
      toast.error(message);
    }
  });

  const onDelete = useCallback(() => {
    if (!role.id) {
      toast.error('Role id is missing');
      return;
    }

    deleteMutation.mutate(Number(role.id));
  }, [deleteMutation, role.id]);

  const onManage = useCallback(() => {
    router.push(editHref);
  }, [editHref, router]);

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
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onManage}>
            <IconEdit className='mr-2 h-4 w-4 text-blue-500' />
            <span className='text-blue-500'>Edit role</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <IconTrash className='mr-2 h-4 w-4 text-red-500' />
            <span className='text-red-500'>Delete</span>
          </DropdownMenuItem>
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
