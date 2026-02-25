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
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePage } from '@/server/action/page/page';

interface CellActionProps {
  data: { id: string | number } & Record<string, any>;
}

function resolvePageId(data: CellActionProps['data']) {
  const rawId = data?.id ?? (data as any)?._id ?? (data as any)?.pageId ?? '';
  const id = String(rawId).trim();
  return id;
}

export function CellAction({ data }: CellActionProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => {
      const pageId = resolvePageId(data);
      return deletePage(pageId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      router.refresh();
      toast.success('Page deleted successfully');
    }
  });

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteMutation.mutateAsync();
      setOpen(false);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Delete failed';
      toast.error(message);
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
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              const pageId = resolvePageId(data);
              if (!pageId) {
                toast.error('Page id is missing');
                return;
              }
              router.push(`/admin/page/${encodeURIComponent(pageId)}`);
            }}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
