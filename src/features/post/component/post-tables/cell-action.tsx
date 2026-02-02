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
import { IconEdit, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { PostRow } from './columns';
import { toast } from 'sonner';
import { deletePost } from '@/server/action/post/post';

interface CellActionProps {
  data: PostRow;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  const onConfirm = async () => {
    try {
      setLoading(true);
      // Optimistically remove from cache for instant UI feedback
      qc.setQueryData(['posts'], (prev: any) => {
        if (!prev) return prev;
        const remove = (arr: any[]) =>
          arr.filter((p) => String(p?.id) !== String(data.id));
        if (Array.isArray(prev)) return remove(prev);
        if (Array.isArray(prev?.data))
          return { ...prev, data: remove(prev.data) };
        if (Array.isArray(prev?.items))
          return { ...prev, items: remove(prev.items) };
        return prev;
      });

      const result = await deletePost(data.id);
      if (!result.success) {
        throw new Error(result.error || 'Delete failed please try again');
      }
      toast.success('Post deleted successfully');
      setOpen(false);
      router.replace('/admin/post');
      // Keep data fresh in background
      qc.invalidateQueries({ queryKey: ['posts'], exact: false });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Delete failed please try again';
      toast.error(msg);
      // Refetch to rollback if needed
      qc.invalidateQueries({ queryKey: ['posts'], exact: false });
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
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={(event) => event.stopPropagation()}
          >
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/admin/post/${data.id}`);
            }}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              setOpen(true);
            }}
          >
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
