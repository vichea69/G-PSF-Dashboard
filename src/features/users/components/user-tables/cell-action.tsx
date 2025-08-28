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
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye
} from '@tabler/icons-react';
import { useState } from 'react';
import type { UserRow } from './columns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserUpsertDialog } from '../user-upsert-dialog';
import { deleteAdminUser } from '@/server/action/admin/admin';
import { UserViewDialog } from '../user-view-dialog';

interface CellActionProps {
  data: UserRow;
}

export function UsersCellAction({ data }: CellActionProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => deleteAdminUser(String(data.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (e: any) => {
      const detail = e?.response?.data;
      const msg =
        detail?.message ||
        detail?.error ||
        (typeof detail === 'string' ? detail : undefined) ||
        (typeof e?.message === 'string' ? e.message : undefined) ||
        'Delete failed';
      toast.error(msg);
      console.error('Delete user error', e?.response?.status, detail, e);
    }
  });

  const onConfirm = async () => {
    await deleteMutation.mutateAsync();
    setOpenDelete(false);
  };

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

      <UserViewDialog open={openView} onOpenChange={setOpenView} user={data} />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpenView(true)}>
            <IconEye className='mr-2 h-4 w-4' /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
