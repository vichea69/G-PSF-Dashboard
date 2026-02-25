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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDeleteContact } from '@/features/contact/hook/use-contact';

export default function CellAction({ id }: { id: string }) {
  const deleteContactMutation = useDeleteContact();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onConfirm() {
    try {
      setLoading(true);
      await deleteContactMutation.mutateAsync(id);
      toast.success('Contact deleted');
      setOpen(false);
    } catch (error: any) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to delete contact';
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
            size='icon'
            className='h-9 w-9 rounded-xl'
            aria-label='Actions'
            data-row-action
            onClick={(event) => event.stopPropagation()}
          >
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            align='end'
            sideOffset={8}
            className='z-[9999] w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl'
          >
            <DropdownMenuItem asChild className='cursor-pointer rounded-lg'>
              <Link
                href={`/admin/contact/${id}`}
                className='flex items-center gap-2 px-2 py-2'
                data-row-action
              >
                <IconEye className='h-4 w-4' />
                View
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
              disabled={loading}
              className='cursor-pointer rounded-lg text-red-600 focus:text-red-700'
              data-row-action
            >
              <IconTrash className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </>
  );
}
