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
import { useState } from 'react';
import type { CategoryRow } from './columns';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CellActionProps {
  data: CategoryRow;
}

export const CategoryCellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const canUpdateCategory = can(
    adminRoutePermissions.categories.update.resource,
    adminRoutePermissions.categories.update.action
  );
  const canDeleteCategory = can(
    adminRoutePermissions.categories.delete.resource,
    adminRoutePermissions.categories.delete.action
  );

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/categories/${data.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      router.refresh();
      toast.success('Category deleted successfully');
    }
  });

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteMutation.mutateAsync();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!canUpdateCategory && !canDeleteCategory) {
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
      <div onClick={(event) => event.stopPropagation()}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
              data-row-action
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <span className='sr-only'>Open menu</span>
              <IconDotsVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {canUpdateCategory ? (
              <DropdownMenuItem
                onClick={() => router.push(`/admin/category/${data.id}`)}
              >
                <IconEdit className='mr-2 h-4 w-4' /> Update
              </DropdownMenuItem>
            ) : null}
            {canDeleteCategory ? (
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <IconTrash className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
